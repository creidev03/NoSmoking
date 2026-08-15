"use server";

import { db } from "@/lib/db";
import { game_state, events, badges, userAchievements, achievementProgress } from "@/db/schema";
import { eq, gte, and, sql, count } from "drizzle-orm";
import { checkMidnightReset, type GameState } from "@/lib/game-state";
import { getPhase, getNextActionAvailableAt, isCooldownActive } from "@/lib/cooldown";
import { randomUUID } from "crypto";
import { evaluateAchievements } from "@/lib/achievements";
import { normalizeEventWithPenalty, type TimelineEvent, type TimelineFilter } from "@/lib/timeline";
import type { Achievement } from "@/lib/achievements/types";

type ActionType = "breathing" | "meditation" | "music";

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

export async function registerCigarette(userId: string): Promise<CigaretteResult> {
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

  // Evaluate achievements after transaction commits
  const { unlocked } = await evaluateAchievements(userId);
  return { ...transactionResult, unlockedAchievements: unlocked };
}

export async function registerPositiveAction(
  userId: string,
  actionType: ActionType
): Promise<ActionResult> {
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

  // Only evaluate achievements if the action was successful (no cooldown error)
  if (transactionResult.error) {
    return { ...transactionResult, unlockedAchievements: [] };
  }

  const { unlocked } = await evaluateAchievements(userId);
  return { ...transactionResult, unlockedAchievements: unlocked };
}

// DEV ONLY: Reset all lives to full
export async function devResetLives(userId: string): Promise<GameState> {
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
export async function devRemoveCooldown(userId: string): Promise<GameState> {
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
export async function processMidnightReset(userId: string): Promise<{
  gameState: GameState;
  newBadges: string[];
  achievements: UserAchievementData;
}> {
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

  // Evaluate achievements after reset is persisted
  await evaluateAchievements(userId);

  // Return fresh achievement data
  const achievements = await getUserAchievements(userId);

  return { ...transactionResult, achievements };
}

export async function getUserAchievements(userId: string): Promise<UserAchievementData> {
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
  userId: string,
  filter: TimelineFilter = "all",
  page: number = 0,
  limit: number = 20
): Promise<{ events: TimelineEvent[]; hasMore: boolean; total: number }> {
  const gs = await db
    .select()
    .from(game_state)
    .where(eq(game_state.userId, userId))
    .get();

  if (!gs) {
    return { events: [], hasMore: false, total: 0 };
  }

  // Date filter boundaries (ISO strings for SQLite comparison)
  let sinceDate: string | null = null;
  const now = new Date();
  if (filter === "today") {
    sinceDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  } else if (filter === "week") {
    const d = new Date(now);
    d.setDate(d.getDate() - 7);
    sinceDate = d.toISOString();
  } else if (filter === "month") {
    const d = new Date(now);
    d.setDate(d.getDate() - 30);
    sinceDate = d.toISOString();
  }

  // Total count
  const whereClause = sinceDate
    ? and(eq(events.gameStateId, gs.id), gte(events.createdAt, sinceDate))
    : eq(events.gameStateId, gs.id);

  const [totalRow] = await db
    .select({ cnt: count() })
    .from(events)
    .where(whereClause)
    .all();

  const total = totalRow?.cnt ?? 0;

  // Paginated events
  const offset = page * limit;
  const rows = await db
    .select()
    .from(events)
    .where(whereClause)
    .orderBy(sql`${events.createdAt} DESC`)
    .limit(limit)
    .offset(offset)
    .all();

  const timelineEvents: TimelineEvent[] = [];
  for (const row of rows) {
    const normalized = normalizeEventWithPenalty({
      id: row.id,
      type: row.type,
      detail: row.detail,
      createdAt: row.createdAt,
    });
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
 * Get all achievements from the database, sorted by category then difficulty.
 * This is used by the logros page to display all achievements.
 */
export async function getAllAchievements(): Promise<Achievement[]> {
  const rows = await db
    .select()
    .from(achievements)
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
