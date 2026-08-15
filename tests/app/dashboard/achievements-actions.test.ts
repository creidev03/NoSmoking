import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock evaluateAchievements
vi.mock("@/lib/achievements", () => ({
  evaluateAchievements: vi.fn().mockResolvedValue({ unlocked: [] }),
}));

// Mock the Turso client module
const mockExecute = vi.fn();
vi.mock("@/lib/db", () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          get: vi.fn(() => Promise.resolve(null)),
          all: vi.fn(() => Promise.resolve([])),
        })),
      })),
    })),
    insert: vi.fn(() => ({
      values: vi.fn(() => ({
        returning: vi.fn(() => ({
          get: vi.fn(() =>
            Promise.resolve({
              id: "test-event-id",
              gameStateId: "test-game-state-id",
              type: "penalty",
              detail: null,
              createdAt: "2026-01-15T10:00:00.000Z",
            })
          ),
        })),
      })),
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(() => Promise.resolve()),
      })),
    })),
    transaction: vi.fn((fn: any) =>
      fn({
        select: vi.fn(() => ({
          from: vi.fn(() => ({
            where: vi.fn(() => ({
              get: vi.fn(() => Promise.resolve(null)),
              all: vi.fn(() => Promise.resolve([])),
            })),
          })),
        })),
        insert: vi.fn(() => ({
          values: vi.fn(() => ({
            returning: vi.fn(() => ({
              get: vi.fn(() =>
                Promise.resolve({
                  id: "test-event-id",
                  gameStateId: "test-game-state-id",
                  type: "penalty",
                  detail: null,
                  createdAt: "2026-01-15T10:00:00.000Z",
                })
              ),
            })),
          })),
        })),
        update: vi.fn(() => ({
          set: vi.fn(() => ({
            where: vi.fn(() => Promise.resolve()),
          })),
        })),
      })
    ),
  },
}));

import {
  registerCigarette,
  registerPositiveAction,
  getUserAchievements,
} from "@/app/dashboard/actions";
import { db } from "@/lib/db";
import { evaluateAchievements } from "@/lib/achievements";

const mockDb = vi.mocked(db);
const mockEvaluateAchievements = vi.mocked(evaluateAchievements);

// Helper to create a game_state-like object
function createGameState(overrides: Record<string, any> = {}) {
  return {
    id: "gs-1",
    userId: "user-1",
    totalLives: 4,
    remainingLives: 4,
    cigarettesToday: 0,
    streakDays: 0,
    lastCigaretteAt: null,
    lastActionAt: null,
    nextActionAvailableAt: null,
    status: "active",
    relapseStartedAt: null,
    totalPoints: 0,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-15T10:00:00.000Z",
    ...overrides,
  };
}

// Helper to create a mock transaction with a specific game state
function mockTransactionWithGameState(gameState: any) {
  const mockTx = {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          get: vi.fn(() => Promise.resolve(gameState)),
          all: vi.fn(() => Promise.resolve([])),
        })),
      })),
    })),
    insert: vi.fn(() => ({
      values: vi.fn(() => ({
        returning: vi.fn(() => ({
          get: vi.fn(() =>
            Promise.resolve({
              id: "test-event-id",
              gameStateId: gameState.id,
              type: "penalty",
              detail: null,
              createdAt: new Date().toISOString(),
            })
          ),
        })),
      })),
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(() => Promise.resolve()),
      })),
    })),
  };
  return mockTx;
}

describe("Achievements integration in actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-15T10:00:00.000Z"));
    mockEvaluateAchievements.mockResolvedValue({ unlocked: [] });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("registerCigarette - achievements evaluation", () => {
    it("calls evaluateAchievements after cigarette registration", async () => {
      const gameState = createGameState({ cigarettesToday: 2, remainingLives: 4 });
      const mockTx = mockTransactionWithGameState(gameState);
      mockDb.transaction.mockImplementation((fn: any) => fn(mockTx));

      await registerCigarette("user-1");

      expect(mockEvaluateAchievements).toHaveBeenCalledWith("user-1");
    });

    it("returns unlocked achievements from evaluateAchievements", async () => {
      const gameState = createGameState({ cigarettesToday: 2, remainingLives: 4 });
      const mockTx = mockTransactionWithGameState(gameState);
      mockDb.transaction.mockImplementation((fn: any) => fn(mockTx));

      mockEvaluateAchievements.mockResolvedValue({ unlocked: ["T001", "A001"] });

      const result = await registerCigarette("user-1");

      expect(result.unlockedAchievements).toEqual(["T001", "A001"]);
    });

    it("returns empty array when no achievements unlock", async () => {
      const gameState = createGameState({ cigarettesToday: 2, remainingLives: 4 });
      const mockTx = mockTransactionWithGameState(gameState);
      mockDb.transaction.mockImplementation((fn: any) => fn(mockTx));

      const result = await registerCigarette("user-1");

      expect(result.unlockedAchievements).toEqual([]);
    });

    it("still returns game state and penalty info when achievements unlock", async () => {
      const gameState = createGameState({ cigarettesToday: 4, remainingLives: 4 });
      const mockTx = mockTransactionWithGameState(gameState);
      mockDb.transaction.mockImplementation((fn: any) => fn(mockTx));

      mockEvaluateAchievements.mockResolvedValue({ unlocked: ["T001"] });

      const result = await registerCigarette("user-1");

      expect(result.penaltyApplied).toBe(true);
      expect(result.gameState.cigarettesToday).toBe(0);
      expect(result.unlockedAchievements).toEqual(["T001"]);
    });
  });

  describe("registerPositiveAction - achievements evaluation", () => {
    it("calls evaluateAchievements after positive action registration", async () => {
      const gameState = createGameState({
        lastCigaretteAt: "2026-01-15T09:30:00.000Z",
        nextActionAvailableAt: null,
      });
      const mockTx = mockTransactionWithGameState(gameState);
      mockDb.transaction.mockImplementation((fn: any) => fn(mockTx));

      await registerPositiveAction("user-1", "breathing");

      expect(mockEvaluateAchievements).toHaveBeenCalledWith("user-1");
    });

    it("returns unlocked achievements from evaluateAchievements", async () => {
      const gameState = createGameState({
        lastCigaretteAt: "2026-01-15T09:30:00.000Z",
        nextActionAvailableAt: null,
      });
      const mockTx = mockTransactionWithGameState(gameState);
      mockDb.transaction.mockImplementation((fn: any) => fn(mockTx));

      mockEvaluateAchievements.mockResolvedValue({ unlocked: ["A001"] });

      const result = await registerPositiveAction("user-1", "breathing");

      expect(result.unlockedAchievements).toEqual(["A001"]);
    });

    it("returns empty array when no achievements unlock", async () => {
      const gameState = createGameState({
        lastCigaretteAt: "2026-01-15T09:30:00.000Z",
        nextActionAvailableAt: null,
      });
      const mockTx = mockTransactionWithGameState(gameState);
      mockDb.transaction.mockImplementation((fn: any) => fn(mockTx));

      const result = await registerPositiveAction("user-1", "breathing");

      expect(result.unlockedAchievements).toEqual([]);
    });

    it("does not call evaluateAchievements when blocked by cooldown", async () => {
      const futureDate = new Date("2026-01-15T11:00:00.000Z").toISOString();
      const gameState = createGameState({
        lastCigaretteAt: "2026-01-15T08:00:00.000Z",
        nextActionAvailableAt: futureDate,
      });
      const mockTx = mockTransactionWithGameState(gameState);
      mockDb.transaction.mockImplementation((fn: any) => fn(mockTx));

      await registerPositiveAction("user-1", "breathing");

      expect(mockEvaluateAchievements).not.toHaveBeenCalled();
    });

    it("still returns game state and cooldown info when achievements unlock", async () => {
      const gameState = createGameState({
        lastCigaretteAt: "2026-01-15T09:30:00.000Z",
        nextActionAvailableAt: null,
      });
      const mockTx = mockTransactionWithGameState(gameState);
      mockDb.transaction.mockImplementation((fn: any) => fn(mockTx));

      mockEvaluateAchievements.mockResolvedValue({ unlocked: ["A001", "A002"] });

      const result = await registerPositiveAction("user-1", "breathing");

      expect(result.cooldownMinutes).toBe(20);
      expect(result.unlockedAchievements).toEqual(["A001", "A002"]);
    });
  });
});

describe("getUserAchievements", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-15T10:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns user achievements and progress from database", async () => {
    const mockUserAchievements = [
      { achievementId: "T001", unlockedAt: "2026-01-10T10:00:00.000Z" },
      { achievementId: "A001", unlockedAt: "2026-01-12T10:00:00.000Z" },
    ];
    const mockProgress = [
      { achievementId: "T002", currentValue: 50 },
      { achievementId: "A002", currentValue: 25 },
    ];

    // First call returns userAchievements
    mockDb.select.mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          all: vi.fn().mockResolvedValueOnce(mockUserAchievements),
        }),
      }),
    } as any);

    // Second call returns progress
    mockDb.select.mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          all: vi.fn().mockResolvedValueOnce(mockProgress),
        }),
      }),
    } as any);

    const result = await getUserAchievements("user-1");

    expect(result.userAchievements).toEqual(mockUserAchievements);
    expect(result.progress).toEqual(mockProgress);
  });

  it("returns empty arrays when user has no achievements or progress", async () => {
    mockDb.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          all: vi.fn().mockResolvedValueOnce([]),
        }),
      }),
    } as any);

    mockDb.select.mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          all: vi.fn().mockResolvedValueOnce([]),
        }),
      }),
    } as any);

    const result = await getUserAchievements("user-1");

    expect(result.userAchievements).toEqual([]);
    expect(result.progress).toEqual([]);
  });

  it("queries correct tables for user achievements and progress", async () => {
    mockDb.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          all: vi.fn().mockResolvedValueOnce([]),
        }),
      }),
    } as any);

    mockDb.select.mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          all: vi.fn().mockResolvedValueOnce([]),
        }),
      }),
    } as any);

    await getUserAchievements("user-1");

    expect(mockDb.select).toHaveBeenCalledTimes(2);
  });
});
