import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  computeInitialLives,
  checkMidnightReset,
  type GameState,
} from "@/lib/game-state";

describe("game-state", () => {
  describe("computeInitialLives", () => {
    it("returns 1 for 0 cigarettes per day", () => {
      expect(computeInitialLives(0)).toBe(1);
    });

    it("returns 1 for 4 cigarettes per day", () => {
      expect(computeInitialLives(4)).toBe(1);
    });

    it("returns 1 for 5 cigarettes per day (floor(5/5)=1)", () => {
      expect(computeInitialLives(5)).toBe(1);
    });

    it("returns 2 for 10 cigarettes per day", () => {
      expect(computeInitialLives(10)).toBe(2);
    });

    it("returns 2 for 12 cigarettes per day", () => {
      expect(computeInitialLives(12)).toBe(2);
    });

    it("returns 5 for 25 cigarettes per day", () => {
      expect(computeInitialLives(25)).toBe(5);
    });

    it("returns 10 for 50 cigarettes per day", () => {
      expect(computeInitialLives(50)).toBe(10);
    });

    it("caps at 10 for 60 cigarettes per day", () => {
      expect(computeInitialLives(60)).toBe(10);
    });

    it("caps at 10 for 100 cigarettes per day", () => {
      expect(computeInitialLives(100)).toBe(10);
    });

    it("returns minimum 1 for 1 cigarette per day", () => {
      expect(computeInitialLives(1)).toBe(1);
    });
  });

  describe("checkMidnightReset", () => {
    it("increments streak on clean day (cigarettes < 5)", () => {
      const gameState: GameState = {
        id: "gs-1",
        userId: "u-1",
        totalLives: 4,
        remainingLives: 4,
        cigarettesToday: 2,
        streakDays: 3,
        lastCigaretteAt: "2026-01-15T10:00:00Z",
        lastActionAt: null,
        nextActionAvailableAt: null,
        status: "active",
        relapseStartedAt: null,
        createdAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-01-15T23:59:00Z",
      };

      const now = new Date("2026-01-16T00:01:00Z");
      const result = checkMidnightReset(gameState, now);

      expect(result.streakDays).toBe(4);
      expect(result.cigarettesToday).toBe(0);
      expect(result.updatedAt).toContain("2026-01-16T00:01:00");
    });

    it("resets streak on relapse day (cigarettes >= 5)", () => {
      const gameState: GameState = {
        id: "gs-1",
        userId: "u-1",
        totalLives: 4,
        remainingLives: 3,
        cigarettesToday: 5,
        streakDays: 7,
        lastCigaretteAt: "2026-01-15T20:00:00Z",
        lastActionAt: null,
        nextActionAvailableAt: null,
        status: "active",
        relapseStartedAt: null,
        createdAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-01-15T23:59:00Z",
      };

      const now = new Date("2026-01-16T00:01:00Z");
      const result = checkMidnightReset(gameState, now);

      expect(result.streakDays).toBe(0);
      expect(result.cigarettesToday).toBe(0);
    });

    it("does not reset if same day (no midnight passed)", () => {
      const gameState: GameState = {
        id: "gs-1",
        userId: "u-1",
        totalLives: 4,
        remainingLives: 4,
        cigarettesToday: 2,
        streakDays: 3,
        lastCigaretteAt: "2026-01-15T10:00:00Z",
        lastActionAt: null,
        nextActionAvailableAt: null,
        status: "active",
        relapseStartedAt: null,
        createdAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-01-15T14:00:00Z",
      };

      const now = new Date("2026-01-15T15:00:00Z");
      const result = checkMidnightReset(gameState, now);

      expect(result.streakDays).toBe(3);
      expect(result.cigarettesToday).toBe(2);
    });

    it("resets streak from 0 on clean day (stays 1)", () => {
      const gameState: GameState = {
        id: "gs-1",
        userId: "u-1",
        totalLives: 2,
        remainingLives: 1,
        cigarettesToday: 0,
        streakDays: 0,
        lastCigaretteAt: "2026-01-14T20:00:00Z",
        lastActionAt: null,
        nextActionAvailableAt: null,
        status: "active",
        relapseStartedAt: null,
        createdAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-01-15T23:00:00Z",
      };

      const now = new Date("2026-01-16T00:01:00Z");
      const result = checkMidnightReset(gameState, now);

      expect(result.streakDays).toBe(1);
      expect(result.cigarettesToday).toBe(0);
    });

    it("increments streak at boundary (4 cigarettes = clean day)", () => {
      const gameState: GameState = {
        id: "gs-1",
        userId: "u-1",
        totalLives: 4,
        remainingLives: 4,
        cigarettesToday: 4,
        streakDays: 6,
        lastCigaretteAt: "2026-01-15T18:00:00Z",
        lastActionAt: null,
        nextActionAvailableAt: null,
        status: "active",
        relapseStartedAt: null,
        createdAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-01-15T23:59:00Z",
      };

      const now = new Date("2026-01-16T00:01:00Z");
      const result = checkMidnightReset(gameState, now);

      expect(result.streakDays).toBe(7);
      expect(result.cigarettesToday).toBe(0);
    });

    it("resets streak at boundary (5 cigarettes = relapse)", () => {
      const gameState: GameState = {
        id: "gs-1",
        userId: "u-1",
        totalLives: 4,
        remainingLives: 3,
        cigarettesToday: 5,
        streakDays: 29,
        lastCigaretteAt: "2026-01-15T20:00:00Z",
        lastActionAt: null,
        nextActionAvailableAt: null,
        status: "active",
        relapseStartedAt: null,
        createdAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-01-15T23:59:00Z",
      };

      const now = new Date("2026-01-16T00:01:00Z");
      const result = checkMidnightReset(gameState, now);

      expect(result.streakDays).toBe(0);
      expect(result.cigarettesToday).toBe(0);
    });

    it("does not reset if updatedAt is exactly midnight boundary", () => {
      const gameState: GameState = {
        id: "gs-1",
        userId: "u-1",
        totalLives: 4,
        remainingLives: 4,
        cigarettesToday: 2,
        streakDays: 5,
        lastCigaretteAt: "2026-01-15T10:00:00Z",
        lastActionAt: null,
        nextActionAvailableAt: null,
        status: "active",
        relapseStartedAt: null,
        createdAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-01-16T00:00:00Z",
      };

      const now = new Date("2026-01-16T00:00:00Z");
      const result = checkMidnightReset(gameState, now);

      expect(result.streakDays).toBe(5);
      expect(result.cigarettesToday).toBe(2);
    });
  });
});
