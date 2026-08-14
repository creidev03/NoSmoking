import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  computeInitialLives,
  checkMidnightReset,
  checkRelapseWindowExpired,
  type GameState,
  type MidnightResetResult,
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

      expect(result.gameState.streakDays).toBe(4);
      expect(result.gameState.cigarettesToday).toBe(0);
      expect(result.gameState.updatedAt).toContain("2026-01-16T00:01:00");
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

      expect(result.gameState.streakDays).toBe(0);
      expect(result.gameState.cigarettesToday).toBe(0);
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

      expect(result.gameState.streakDays).toBe(3);
      expect(result.gameState.cigarettesToday).toBe(2);
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

      expect(result.gameState.streakDays).toBe(1);
      expect(result.gameState.cigarettesToday).toBe(0);
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

      expect(result.gameState.streakDays).toBe(7);
      expect(result.gameState.cigarettesToday).toBe(0);
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

      expect(result.gameState.streakDays).toBe(0);
      expect(result.gameState.cigarettesToday).toBe(0);
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

      expect(result.gameState.streakDays).toBe(5);
      expect(result.gameState.cigarettesToday).toBe(2);
    });

    it("resets relapse state when 24h window expires", () => {
      const gameState: GameState = {
        id: "gs-1",
        userId: "u-1",
        totalLives: 4,
        remainingLives: 0,
        cigarettesToday: 5,
        streakDays: 0,
        lastCigaretteAt: "2026-01-15T20:00:00Z",
        lastActionAt: null,
        nextActionAvailableAt: null,
        status: "relapse",
        relapseStartedAt: "2026-01-15T23:00:00Z",
        createdAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-01-15T23:59:00Z",
      };

      // 25 hours after relapse — past 24h window
      const now = new Date("2026-01-17T00:00:00Z");
      const result = checkMidnightReset(gameState, now);

      expect(result.gameState.status).toBe("active");
      expect(result.gameState.relapseStartedAt).toBeNull();
      expect(result.gameState.streakDays).toBe(0);
      expect(result.gameState.cigarettesToday).toBe(0);
    });

    it("does not reset relapse state within 24h window", () => {
      const gameState: GameState = {
        id: "gs-1",
        userId: "u-1",
        totalLives: 4,
        remainingLives: 0,
        cigarettesToday: 5,
        streakDays: 0,
        lastCigaretteAt: "2026-01-15T20:00:00Z",
        lastActionAt: null,
        nextActionAvailableAt: null,
        status: "relapse",
        relapseStartedAt: "2026-01-15T23:00:00Z",
        createdAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-01-15T23:59:00Z",
      };

      // 12 hours after relapse — within 24h window
      const now = new Date("2026-01-16T11:00:00Z");
      const result = checkMidnightReset(gameState, now);

      expect(result.gameState.status).toBe("relapse");
      expect(result.gameState.relapseStartedAt).toBe("2026-01-15T23:00:00Z");
    });

    it("returns new badges when streak crosses threshold", () => {
      const gameState: GameState = {
        id: "gs-1",
        userId: "u-1",
        totalLives: 4,
        remainingLives: 4,
        cigarettesToday: 2,
        streakDays: 6,
        lastCigaretteAt: "2026-01-15T10:00:00Z",
        lastActionAt: null,
        nextActionAvailableAt: null,
        status: "active",
        relapseStartedAt: null,
        createdAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-01-15T23:59:00Z",
      };

      // Streak goes from 6 → 7 (crosses primera_semana threshold)
      const now = new Date("2026-01-16T00:01:00Z");
      const result = checkMidnightReset(gameState, now, []);

      expect(result.gameState.streakDays).toBe(7);
      expect(result.newBadges).toEqual(["primera_semana"]);
    });

    it("returns no new badges when streak does not cross threshold", () => {
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
      const result = checkMidnightReset(gameState, now, []);

      expect(result.gameState.streakDays).toBe(4);
      expect(result.newBadges).toEqual([]);
    });

    it("does not duplicate already earned badges", () => {
      const gameState: GameState = {
        id: "gs-1",
        userId: "u-1",
        totalLives: 4,
        remainingLives: 4,
        cigarettesToday: 2,
        streakDays: 6,
        lastCigaretteAt: "2026-01-15T10:00:00Z",
        lastActionAt: null,
        nextActionAvailableAt: null,
        status: "active",
        relapseStartedAt: null,
        createdAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-01-15T23:59:00Z",
      };

      const now = new Date("2026-01-16T00:01:00Z");
      const result = checkMidnightReset(gameState, now, ["primera_semana"]);

      expect(result.gameState.streakDays).toBe(7);
      expect(result.newBadges).toEqual([]);
    });
  });

  describe("checkRelapseWindowExpired", () => {
    it("returns false when not in relapse (relapseStartedAt is null)", () => {
      const gameState: GameState = {
        id: "gs-1",
        userId: "u-1",
        totalLives: 4,
        remainingLives: 0,
        cigarettesToday: 5,
        streakDays: 0,
        lastCigaretteAt: "2026-01-15T20:00:00Z",
        lastActionAt: null,
        nextActionAvailableAt: null,
        status: "active",
        relapseStartedAt: null,
        createdAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-01-15T23:59:00Z",
      };

      const now = new Date("2026-01-17T00:00:00Z");
      expect(checkRelapseWindowExpired(gameState, now)).toBe(false);
    });

    it("returns false when within 24h window", () => {
      const gameState: GameState = {
        id: "gs-1",
        userId: "u-1",
        totalLives: 4,
        remainingLives: 0,
        cigarettesToday: 5,
        streakDays: 0,
        lastCigaretteAt: "2026-01-15T20:00:00Z",
        lastActionAt: null,
        nextActionAvailableAt: null,
        status: "relapse",
        relapseStartedAt: "2026-01-15T23:00:00Z",
        createdAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-01-15T23:59:00Z",
      };

      // 12 hours after relapse — within 24h window
      const now = new Date("2026-01-16T11:00:00Z");
      expect(checkRelapseWindowExpired(gameState, now)).toBe(false);
    });

    it("returns true when 24h window has expired", () => {
      const gameState: GameState = {
        id: "gs-1",
        userId: "u-1",
        totalLives: 4,
        remainingLives: 0,
        cigarettesToday: 5,
        streakDays: 0,
        lastCigaretteAt: "2026-01-15T20:00:00Z",
        lastActionAt: null,
        nextActionAvailableAt: null,
        status: "relapse",
        relapseStartedAt: "2026-01-15T23:00:00Z",
        createdAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-01-15T23:59:00Z",
      };

      // 25 hours after relapse — past 24h window
      const now = new Date("2026-01-17T00:00:00Z");
      expect(checkRelapseWindowExpired(gameState, now)).toBe(true);
    });

    it("returns true exactly at 24h boundary", () => {
      const gameState: GameState = {
        id: "gs-1",
        userId: "u-1",
        totalLives: 4,
        remainingLives: 0,
        cigarettesToday: 5,
        streakDays: 0,
        lastCigaretteAt: "2026-01-15T20:00:00Z",
        lastActionAt: null,
        nextActionAvailableAt: null,
        status: "relapse",
        relapseStartedAt: "2026-01-15T23:00:00Z",
        createdAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-01-15T23:59:00Z",
      };

      // Exactly 24h after relapse
      const now = new Date("2026-01-16T23:00:00Z");
      expect(checkRelapseWindowExpired(gameState, now)).toBe(true);
    });

    it("resets game state when window expires", () => {
      const gameState: GameState = {
        id: "gs-1",
        userId: "u-1",
        totalLives: 4,
        remainingLives: 0,
        cigarettesToday: 5,
        streakDays: 0,
        lastCigaretteAt: "2026-01-15T20:00:00Z",
        lastActionAt: null,
        nextActionAvailableAt: null,
        status: "relapse",
        relapseStartedAt: "2026-01-15T23:00:00Z",
        createdAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-01-15T23:59:00Z",
      };

      const now = new Date("2026-01-17T00:00:00Z");
      const result = checkRelapseWindowExpired(gameState, now);

      expect(result).toBe(true);
    });
  });
});
