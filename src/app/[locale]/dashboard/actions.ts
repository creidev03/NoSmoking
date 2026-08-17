"use server";

import { db } from "@/lib/db";
import { game_state, events, badges, userAchievements, achievementProgress, achievements } from "@/db/schema";
import { eq, gte, and, sql, count } from "drizzle-orm";
import { checkMidnightReset, type GameState } from "@/lib/game-state";
import { getPhase, getNextActionAvailableAt, isCooldownActive } from "@/lib/cooldown";
import { randomUUID } from "crypto";
import { evaluateAchievements } from "@/lib/achievements";
import { requireAuth } from "@/lib/auth-guard";
import { normalizeEventWithPenalty, type TimelineEvent, type TimelineFilter, type TranslationFn } from "@/lib/timeline";
import type { Achievement } from "@/lib/achievements/types";
import enMessages from "../../../../messages/en.json";
import esMessages from "../../../../messages/es.json";

type ActionType = "breathing" | "meditation" | "music";

const messages = { en: enMessages, es: esMessages } as const;

function getNestedValue(obj: any, path: string): string | undefined {
  const keys = path.split(".");
  let current = obj;
  for (const key of keys) {
    if (current === null || current === undefined) return undefined;
    current = current[key];
  }
  return typeof current === "string" ? current : undefined;
}

function createTranslationFn(locale: string, namespace?: string): TranslationFn {
  const msgs = messages[locale as "en" | "es"] || messages.es;
  return (key: string, params?: Record<string, any>): string => {
    const fullKey = namespace ? `${namespace}.${key}` : key;
    let value = getNestedValue(msgs, fullKey);
    if (value === undefined) return key;
    if (params) {
      for (const [paramKey, paramValue] of Object.entries(params)) {
        value = value.replace(new RegExp(`\\{${paramKey}\\}`, "g"), String(paramValue));
      }
    }
    return value;
  };
}

const CIGS_PER_LIFE = 5;
const MAX_EXTRA_POINTS = 3;
const LIFE_RECOVERY_PER_ACTION = 0.5;

const ACTION_SUBTYPES: Record<ActionType, string> = {
  breathing: "respiracion",
  meditation: "meditacion",
  music: "musica",
};

// ponytail: nominal session length (spec gives ranges, not a tracked duration); wire to a real
// stopwatch in ActionButtons if per-session duration ever needs to be exact.
const ACTION_DURATIONS_SECONDS: Record<ActionType, number> = {
  breathing: 450, // 5-10 min range midpoint
  meditation: 750, // 10-15 min range midpoint
  music: 300,
};

interface CigaretteResult {
  gameState: GameState;
  penaltyApplied: boolean;
  newCycle: boolean;
  unlockedAchievements: string[];
}

interface ActionResult {
  gameState: GameState;
  cooldownMinutes: number;
  nextActionAvailableAt: string;
  error?: string;
  unlockedAchievements: string[];
}

export interface UserAchievementData {
  userAchievements: { achievementId: string; unlockedAt: string }[];
  progress: { achievementId: string; currentValue: number }[];
}

async function getExistingBadgeKeys(tx: any, gameStateId: string): Promise<string[]> {
  const rows = await tx
    .select()
    .from(badges)
    .where(eq(badges.gameStateId, gameStateId))
    .all();
  return rows.map((r: any) => r.badgeKey);
}

async function insertNewBadges(
  tx: any,
  gameStateId: string,
  newBadges: string[],
  now: string
): Promise<void> {
  for (const badgeKey of newBadges) {
    await tx.insert(badges).values({
      id: randomUUID(),
      gameStateId,
      badgeKey,
      unlockedAt: now,
    });
  }
}

function mapGameState(row: any): GameState {
  return {
    id: row.id,
    userId: row.userId,
    totalLives: row.totalLives,
    remainingLives: row.remainingLives,
    cigarettesToday: row.cigarettesToday,
    streakDays: row.streakDays,
    lastCigaretteAt: row.lastCigaretteAt,
    lastActionAt: row.lastActionAt,
    nextActionAvailableAt: row.nextActionAvailableAt,
    status: row.status,
    relapseStartedAt: row.relapseStartedAt,
    totalPoints: row.totalPoints,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export async function registerCigarette(): Promise<CigaretteResult> {
  const { userId } = await requireAuth();

  const transactionResult = await db.transaction(async (tx) => {
    const row = await tx
      .select()
      .from(game_state)
      .where(eq(game_state.userId, userId))
      .get();

    if (!row) {
      throw new Error("No game state found for user");
    }

    let gameState = mapGameState(row);
    const now = new Date().toISOString();
    let penaltyApplied = false;
    let newCycle = false;

    const existingBadgeKeys = await getExistingBadgeKeys(tx, gameState.id);
    const resetResult = checkMidnightReset(gameState, new Date(), existingBadgeKeys);
    gameState = resetResult.gameState;
    await insertNewBadges(tx, gameState.id, resetResult.newBadges, now);

    const vidasAntes = gameState.remainingLives;
    const newCigarettesToday = gameState.cigarettesToday + 1;

    // Reset streak on first cigarette of the day
    const isFirstCigaretteToday = gameState.cigarettesToday === 0;
    const newStreak = isFirstCigaretteToday ? 0 : gameState.streakDays;

    if (newCigarettesToday >= CIGS_PER_LIFE) {
      penaltyApplied = true;
      newCycle = true;
      const newRemainingLives = gameState.remainingLives - 1;
      const isRelapse = newRemainingLives <= 0;

      await tx
        .update(game_state)
        .set({
          cigarettesToday: 0,
          remainingLives: Math.max(0, newRemainingLives),
          streakDays: newStreak,
          lastCigaretteAt: now,
          status: isRelapse ? "relapse" : gameState.status,
          relapseStartedAt: isRelapse ? now : gameState.relapseStartedAt,
          updatedAt: now,
        })
        .where(eq(game_state.id, gameState.id));

      gameState = {
        ...gameState,
        cigarettesToday: 0,
        remainingLives: Math.max(0, newRemainingLives),
        streakDays: newStreak,
        lastCigaretteAt: now,
        status: isRelapse ? "relapse" : gameState.status,
        relapseStartedAt: isRelapse ? now : gameState.relapseStartedAt,
        updatedAt: now,
      };
    } else {
      await tx
        .update(game_state)
        .set({
          cigarettesToday: newCigarettesToday,
          streakDays: newStreak,
          lastCigaretteAt: now,
          updatedAt: now,
        })
        .where(eq(game_state.id, gameState.id));

      gameState = {
        ...gameState,
        cigarettesToday: newCigarettesToday,
        streakDays: newStreak,
        lastCigaretteAt: now,
        updatedAt: now,
      };
    }

    await tx.insert(events).values({
      id: randomUUID(),
      gameStateId: gameState.id,
      type: "fumar",
      detail: JSON.stringify({
        cantidad: 1,
        cigarrillos_totales_hoy: newCigarettesToday,
        vidas_antes: vidasAntes,
        vidas_despues: gameState.remainingLives,
        penalizacion: penaltyApplied,
      }),
      createdAt: now,
    });

    return { gameState, penaltyApplied, newCycle };
  });

  // Evaluate achievements after the transaction commits — running it inside
  // the transaction holds the Turso interactive-transaction baton open across
  // ~66+ sequential round trips and causes it to expire (404 on commit).
  let unlocked: string[] = [];
  try {
    const result = await evaluateAchievements(userId);
    unlocked = result.unlocked;
  } catch (err) {
    console.error("[actions] evaluateAchievements failed in registerCigarette:", err);
  }

  return { ...transactionResult, unlockedAchievements: unlocked };
}

export async function registerPositiveAction(
  actionType: ActionType
): Promise<ActionResult> {
  const { userId } = await requireAuth();

  const transactionResult = await db.transaction(async (tx) => {
    const row = await tx
      .select()
      .from(game_state)
      .where(eq(game_state.userId, userId))
      .get();

    if (!row) {
      throw new Error("No game state found for user");
    }

    let gameState = mapGameState(row);
    const now = new Date();

    const existingBadgeKeys = await getExistingBadgeKeys(tx, gameState.id);
    const resetResult = checkMidnightReset(gameState, now, existingBadgeKeys);
    gameState = resetResult.gameState;
    await insertNewBadges(tx, gameState.id, resetResult.newBadges, now.toISOString());

    if (isCooldownActive(gameState.nextActionAvailableAt)) {
      return {
        gameState,
        cooldownMinutes: 0,
        nextActionAvailableAt: gameState.nextActionAvailableAt!,
        error: "Cooldown active",
        unlockedAchievements: [],
      };
    }

    const lastCigaretteAt = gameState.lastCigaretteAt
      ? new Date(gameState.lastCigaretteAt)
      : new Date(gameState.createdAt);
    const { cooldownMinutes } = getPhase(lastCigaretteAt, now);
    const nextAvailable = getNextActionAvailableAt(now, cooldownMinutes);
    const nowISO = now.toISOString();
    const livesDelta = LIFE_RECOVERY_PER_ACTION;
    // Once remainingLives is already at totalLives, further recovery banks as
    // totalPoints ("vidas extra") instead of overflowing past the cap, up to MAX_EXTRA_POINTS.
    const rawRemainingLives = gameState.remainingLives + livesDelta;
    const newRemainingLives = Math.min(gameState.totalLives, rawRemainingLives);
    const overflow = rawRemainingLives - newRemainingLives;
    const newTotalPoints = Math.min(MAX_EXTRA_POINTS, gameState.totalPoints + overflow);
    const exitsRelapse = gameState.status === "relapse" && newRemainingLives > 0;

    await tx
      .update(game_state)
      .set({
        remainingLives: newRemainingLives,
        totalPoints: newTotalPoints,
        cigarettesToday: gameState.cigarettesToday,
        streakDays: gameState.streakDays,
        lastActionAt: nowISO,
        nextActionAvailableAt: nextAvailable,
        status: exitsRelapse ? "active" : gameState.status,
        relapseStartedAt: exitsRelapse ? null : gameState.relapseStartedAt,
        updatedAt: nowISO,
      })
      .where(eq(game_state.id, gameState.id));

    await tx.insert(events).values({
      id: randomUUID(),
      gameStateId: gameState.id,
      type: "accion_positiva",
      detail: JSON.stringify({
        subtipos: ACTION_SUBTYPES[actionType],
        duracion_segundos: ACTION_DURATIONS_SECONDS[actionType],
        vidas_recuperadas: livesDelta,
        vidas_totales_despues: newRemainingLives,
        proxima_accion_disponible: nextAvailable,
      }),
      createdAt: nowISO,
    });

    gameState = {
      ...gameState,
      remainingLives: newRemainingLives,
      totalPoints: newTotalPoints,
      lastActionAt: nowISO,
      nextActionAvailableAt: nextAvailable,
      status: exitsRelapse ? "active" : gameState.status,
      relapseStartedAt: exitsRelapse ? null : gameState.relapseStartedAt,
      updatedAt: nowISO,
    };

    return {
      gameState,
      cooldownMinutes,
      nextActionAvailableAt: nextAvailable,
    };
  });

  // Evaluate achievements after the transaction commits — see comment in
  // registerCigarette for why this can't run inside the transaction.
  let unlocked: string[] = [];
  if (!transactionResult.error) {
    try {
      const result = await evaluateAchievements(userId);
      unlocked = result.unlocked;
    } catch (err) {
      console.error("[actions] evaluateAchievements failed in registerPositiveAction:", err);
    }
  }

  return { ...transactionResult, unlockedAchievements: unlocked };
}

// DEV ONLY: Reset all lives to full
export async function devResetLives(): Promise<GameState> {
  const { userId } = await requireAuth();

  if (process.env.NODE_ENV !== "development") {
    throw new Error("This action is only available in development");
  }

  return db.transaction(async (tx) => {
    const row = await tx
      .select()
      .from(game_state)
      .where(eq(game_state.userId, userId))
      .get();

    if (!row) throw new Error("Game state not found");

    const now = new Date().toISOString();

    await tx
      .update(game_state)
      .set({
        remainingLives: row.totalLives,
        totalPoints: 0,
        cigarettesToday: 0,
        status: "active",
        relapseStartedAt: null,
        updatedAt: now,
      })
      .where(eq(game_state.id, row.id));

    return {
      ...row,
      remainingLives: row.totalLives,
      totalPoints: 0,
      cigarettesToday: 0,
      status: "active",
      relapseStartedAt: null,
      updatedAt: now,
    };
  });
}

// DEV ONLY: Remove cooldown
export async function devRemoveCooldown(): Promise<GameState> {
  const { userId } = await requireAuth();

  if (process.env.NODE_ENV !== "development") {
    throw new Error("This action is only available in development");
  }

  return db.transaction(async (tx) => {
    const row = await tx
      .select()
      .from(game_state)
      .where(eq(game_state.userId, userId))
      .get();

    if (!row) throw new Error("Game state not found");

    const now = new Date().toISOString();

    await tx
      .update(game_state)
      .set({
        nextActionAvailableAt: null,
        updatedAt: now,
      })
      .where(eq(game_state.id, row.id));

    return {
      ...row,
      nextActionAvailableAt: null,
      updatedAt: now,
    };
  });
}

/**
 * Process midnight reset: persist the reset if a new day has started,
 * then evaluate achievements so streak-based ones (T001-T008) are
 * checked daily. Returns the updated game state + achievement data.
 */
export async function processMidnightReset(): Promise<{
  gameState: GameState;
  newBadges: string[];
  achievements: UserAchievementData;
}> {
  const { userId } = await requireAuth();

  const transactionResult = await db.transaction(async (tx) => {
    const row = await tx
      .select()
      .from(game_state)
      .where(eq(game_state.userId, userId))
      .get();

    if (!row) {
      throw new Error("No game state found for user");
    }

    const gameState = mapGameState(row);
    const existingBadgeKeys = await getExistingBadgeKeys(tx, gameState.id);
    const resetResult = checkMidnightReset(gameState, new Date(), existingBadgeKeys);

    // Persist the reset if it actually changed state
    const resetHappened =
      resetResult.gameState.streakDays !== row.streakDays ||
      resetResult.gameState.cigarettesToday !== row.cigarettesToday ||
      resetResult.gameState.status !== row.status;

    if (resetHappened) {
      await tx
        .update(game_state)
        .set({
          streakDays: resetResult.gameState.streakDays,
          cigarettesToday: resetResult.gameState.cigarettesToday,
          status: resetResult.gameState.status,
          relapseStartedAt: resetResult.gameState.relapseStartedAt,
          updatedAt: resetResult.gameState.updatedAt,
        })
        .where(eq(game_state.id, gameState.id));

      // Insert any new badges earned during reset
      const now = resetResult.gameState.updatedAt;
      await insertNewBadges(tx, gameState.id, resetResult.newBadges, now);
    }

    return {
      gameState: resetResult.gameState,
      newBadges: resetResult.newBadges,
    };
  });

  // Evaluate achievements after the transaction commits — see comment in
  // registerCigarette for why this can't run inside the transaction.
  try {
    await evaluateAchievements(userId);
  } catch (err) {
    console.error("[actions] evaluateAchievements failed in processMidnightReset:", err);
  }

  // Return fresh achievement data — degrade gracefully on failure
  let achievements: UserAchievementData = { userAchievements: [], progress: [] };
  try {
    achievements = await getUserAchievements();
  } catch (err) {
    console.error("[actions] getUserAchievements failed in processMidnightReset:", err);
  }

  return { ...transactionResult, achievements };
}

export async function getUserAchievements(): Promise<UserAchievementData> {
  const { userId } = await requireAuth();

  const userAchievementRows = await db
    .select()
    .from(userAchievements)
    .where(eq(userAchievements.userId, userId))
    .all();

  const progressRows = await db
    .select()
    .from(achievementProgress)
    .where(eq(achievementProgress.userId, userId))
    .all();

  return {
    userAchievements: userAchievementRows.map((row) => ({
      achievementId: row.achievementId,
      unlockedAt: row.unlockedAt,
    })),
    progress: progressRows.map((row) => ({
      achievementId: row.achievementId,
      currentValue: row.currentValue,
    })),
  };
}

export async function getTimelineEvents(
  filter: TimelineFilter = "all",
  page: number = 0,
  limit: number = 20,
  locale: string = "es",
  timezoneOffset?: number
): Promise<{ events: TimelineEvent[]; hasMore: boolean; total: number }> {
  const { userId } = await requireAuth();

  const gs = await db
    .select()
    .from(game_state)
    .where(eq(game_state.userId, userId))
    .get();

  if (!gs) {
    return { events: [], hasMore: false, total: 0 };
  }

  // Date filter boundaries (ISO strings for SQLite comparison)
  // Apply client timezone offset to compute local midnight
  let sinceDate: string | null = null;
  const now = new Date();
  const clientNow = new Date(now.getTime() - (timezoneOffset ?? 0) * 60_000);
  if (filter === "today") {
    sinceDate = new Date(clientNow.getFullYear(), clientNow.getMonth(), clientNow.getDate()).toISOString();
  } else if (filter === "week") {
    const d = new Date(clientNow);
    d.setDate(d.getDate() - 7);
    sinceDate = d.toISOString();
  } else if (filter === "month") {
    const d = new Date(clientNow);
    d.setDate(d.getDate() - 30);
    sinceDate = d.toISOString();
  }

  // Total count and paginated events in parallel
  const whereClause = sinceDate
    ? and(eq(events.gameStateId, gs.id), gte(events.createdAt, sinceDate))
    : eq(events.gameStateId, gs.id);

  const offset = page * limit;
  const [[totalRow], rows] = await Promise.all([
    db
      .select({ cnt: count() })
      .from(events)
      .where(whereClause)
      .all(),
    db
      .select()
      .from(events)
      .where(whereClause)
      .orderBy(sql`${events.createdAt} DESC`)
      .limit(limit)
      .offset(offset)
      .all(),
  ]);

  const total = totalRow?.cnt ?? 0;

  const t = createTranslationFn(locale, "timeline");
  const timelineEvents: TimelineEvent[] = [];
  for (const row of rows) {
    const normalized = normalizeEventWithPenalty({
      id: row.id,
      type: row.type,
      detail: row.detail,
      createdAt: row.createdAt,
    }, t);
    for (const e of normalized) {
      e.userId = userId;
    }
    timelineEvents.push(...normalized);
  }

  return {
    events: timelineEvents,
    hasMore: offset + limit < total,
    total,
  };
}

/**
 * Check the current relapse status for a user.
 * Returns whether the user is in relapse, time remaining, and recovery progress.
 */
export async function checkRelapseStatus(): Promise<{
  isRelapsed: boolean;
  timeRemaining: number;
  livesRecovered: number;
  livesNeeded: number;
}> {
  const { userId } = await requireAuth();

  const row = await db
    .select()
    .from(game_state)
    .where(eq(game_state.userId, userId))
    .get();

  if (!row) {
    return { isRelapsed: false, timeRemaining: 0, livesRecovered: 0, livesNeeded: 0 };
  }

  const isRelapsed = row.status === "relapse";
  if (!isRelapsed || !row.relapseStartedAt) {
    return { isRelapsed: false, timeRemaining: 0, livesRecovered: 0, livesNeeded: 0 };
  }

  const RELAPSE_WINDOW_MS = 24 * 60 * 60 * 1000;
  const relapseStart = new Date(row.relapseStartedAt);
  const windowEnd = new Date(relapseStart.getTime() + RELAPSE_WINDOW_MS);
  const now = new Date();
  const timeRemaining = Math.max(0, windowEnd.getTime() - now.getTime());

  // Count positive actions since relapse started
  const [countRow] = await db
    .select({ cnt: count() })
    .from(events)
    .where(
      and(
        eq(events.gameStateId, row.id),
        eq(events.type, "accion_positiva"),
        gte(events.createdAt, row.relapseStartedAt)
      )
    )
    .all();

  const livesRecovered = row.totalLives - row.remainingLives;

  return {
    isRelapsed,
    timeRemaining,
    livesRecovered,
    livesNeeded: 1,
  };
}

/**
 * Get all achievements from the database, sorted by category then difficulty.
 * This is used by the logros page to display all achievements.
 */
export async function getAllAchievements(): Promise<Achievement[]> {
  await requireAuth();

  const rows = await db
    .select()
    .from(achievements)
    .limit(100)
    .all();

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    icon: row.icon,
    category: row.category as Achievement["category"],
    difficulty: row.difficulty as Achievement["difficulty"],
    isSecret: row.isSecret,
    description: row.description,
    conditionType: row.conditionType as Achievement["conditionType"],
    conditionValue: Number(row.conditionValue),
  }));
}
