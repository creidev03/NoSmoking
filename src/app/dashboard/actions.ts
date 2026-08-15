"use server";

import { db } from "@/lib/db";
import { game_state, events, badges } from "@/db/schema";
import { eq } from "drizzle-orm";
import { checkMidnightReset, type GameState } from "@/lib/game-state";
import { getPhase, getNextActionAvailableAt, isCooldownActive } from "@/lib/cooldown";
import { randomUUID } from "crypto";

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
}

interface ActionResult {
  gameState: GameState;
  cooldownMinutes: number;
  nextActionAvailableAt: string;
  error?: string;
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
  return db.transaction(async (tx) => {
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
          streakDays: gameState.streakDays,
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
          streakDays: gameState.streakDays,
          lastCigaretteAt: now,
          updatedAt: now,
        })
        .where(eq(game_state.id, gameState.id));

      gameState = {
        ...gameState,
        cigarettesToday: newCigarettesToday,
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
}

export async function registerPositiveAction(
  userId: string,
  actionType: ActionType
): Promise<ActionResult> {
  return db.transaction(async (tx) => {
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
