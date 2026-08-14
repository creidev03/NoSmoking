"use server";

import { db } from "@/lib/db";
import { game_state, events } from "@/db/schema";
import { eq } from "drizzle-orm";
import { checkMidnightReset, type GameState, type MidnightResetResult } from "@/lib/game-state";
import { getPhase, getNextActionAvailableAt, isCooldownActive } from "@/lib/cooldown";
import { randomUUID } from "crypto";

type ActionType = "breathing" | "meditation" | "music";

const CIGS_PER_LIFE = 5;

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

    const resetResult = checkMidnightReset(gameState, new Date());
    gameState = resetResult.gameState;

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
          lastCigaretteAt: now,
          status: isRelapse ? "relapse" : gameState.status,
          relapseStartedAt: isRelapse ? now : gameState.relapseStartedAt,
          updatedAt: now,
        })
        .where(eq(game_state.id, gameState.id));

      await tx.insert(events).values({
        id: randomUUID(),
        gameStateId: gameState.id,
        type: "penalty",
        detail: JSON.stringify({ lives_delta: -1 }),
        createdAt: now,
      });

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

    const resetResult = checkMidnightReset(gameState, now);
    gameState = resetResult.gameState;

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

    await tx
      .update(game_state)
      .set({
        remainingLives: gameState.remainingLives + 1,
        lastActionAt: nowISO,
        nextActionAvailableAt: nextAvailable,
        updatedAt: nowISO,
      })
      .where(eq(game_state.id, gameState.id));

    await tx.insert(events).values({
      id: randomUUID(),
      gameStateId: gameState.id,
      type: "action",
      detail: JSON.stringify({ action_type: actionType, lives_delta: 1 }),
      createdAt: nowISO,
    });

    gameState = {
      ...gameState,
      remainingLives: gameState.remainingLives + 1,
      lastActionAt: nowISO,
      nextActionAvailableAt: nextAvailable,
      updatedAt: nowISO,
    };

    return {
      gameState,
      cooldownMinutes,
      nextActionAvailableAt: nextAvailable,
    };
  });
}
