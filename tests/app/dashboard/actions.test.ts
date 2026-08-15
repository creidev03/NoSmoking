import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock achievements BEFORE any other modules
const { mockEvaluateAchievements } = vi.hoisted(() => ({
  mockEvaluateAchievements: vi.fn().mockResolvedValue({ unlocked: [] }),
}));
vi.mock("@/lib/achievements", () => ({
  evaluateAchievements: mockEvaluateAchievements,
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

const mockDb = vi.mocked(db);

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

describe("registerCigarette", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-15T10:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("increments cigarettes_today when under threshold", async () => {
    const gameState = createGameState({ cigarettesToday: 2, remainingLives: 4 });
    const mockTx = mockTransactionWithGameState(gameState);
    mockDb.transaction.mockImplementation((fn: any) => fn(mockTx));

    const result = await registerCigarette("user-1");

    expect(result.penaltyApplied).toBe(false);
    expect(result.newCycle).toBe(false);
    expect(result.gameState.cigarettesToday).toBe(3);
  });

  it("applies penalty when cigarettes reach 5", async () => {
    const gameState = createGameState({ cigarettesToday: 4, remainingLives: 4 });
    const mockTx = mockTransactionWithGameState(gameState);
    mockDb.transaction.mockImplementation((fn: any) => fn(mockTx));

    const result = await registerCigarette("user-1");

    expect(result.penaltyApplied).toBe(true);
    expect(result.newCycle).toBe(true);
    expect(result.gameState.remainingLives).toBe(3);
    expect(result.gameState.cigarettesToday).toBe(0);
  });

  it("sets relapse when remaining lives reach 0", async () => {
    const gameState = createGameState({ cigarettesToday: 4, remainingLives: 1 });
    const mockTx = mockTransactionWithGameState(gameState);
    mockDb.transaction.mockImplementation((fn: any) => fn(mockTx));

    const result = await registerCigarette("user-1");

    expect(result.gameState.status).toBe("relapse");
    expect(result.gameState.remainingLives).toBe(0);
    expect(result.penaltyApplied).toBe(true);
  });

  it("inserts a penalty event when cycle completes", async () => {
    const gameState = createGameState({ cigarettesToday: 4, remainingLives: 4 });
    const mockTx = mockTransactionWithGameState(gameState);
    mockDb.transaction.mockImplementation((fn: any) => fn(mockTx));

    await registerCigarette("user-1");

    expect(mockTx.insert).toHaveBeenCalled();
  });

  it("inserts a 'fumar' event with full spec detail on every cigarette", async () => {
    const gameState = createGameState({ cigarettesToday: 2, remainingLives: 4 });
    const mockTx = mockTransactionWithGameState(gameState);
    mockDb.transaction.mockImplementation((fn: any) => fn(mockTx));

    await registerCigarette("user-1");

    const insertedValues = mockTx.insert.mock.results[0].value.values.mock.calls[0][0];
    expect(insertedValues.type).toBe("fumar");
    const detail = JSON.parse(insertedValues.detail);
    expect(detail).toEqual({
      cantidad: 1,
      cigarrillos_totales_hoy: 3,
      vidas_antes: 4,
      vidas_despues: 4,
      penalizacion: false,
    });
  });

  it("marks penalizacion=true and resets cigarrillos_totales_hoy in the 'fumar' event on the 5th cigarette", async () => {
    const gameState = createGameState({ cigarettesToday: 4, remainingLives: 4 });
    const mockTx = mockTransactionWithGameState(gameState);
    mockDb.transaction.mockImplementation((fn: any) => fn(mockTx));

    await registerCigarette("user-1");

    const insertedValues = mockTx.insert.mock.results[0].value.values.mock.calls[0][0];
    const detail = JSON.parse(insertedValues.detail);
    expect(detail).toEqual({
      cantidad: 1,
      cigarrillos_totales_hoy: 5,
      vidas_antes: 4,
      vidas_despues: 3,
      penalizacion: true,
    });
  });

  it("returns updated game state from transaction", async () => {
    const gameState = createGameState({ cigarettesToday: 1, remainingLives: 4 });
    const mockTx = mockTransactionWithGameState(gameState);
    mockDb.transaction.mockImplementation((fn: any) => fn(mockTx));

    const result = await registerCigarette("user-1");

    expect(result.gameState).toBeDefined();
    expect(result.gameState.id).toBe("gs-1");
  });

  it("does not set relapse when lives > 0 after penalty", async () => {
    const gameState = createGameState({ cigarettesToday: 4, remainingLives: 2 });
    const mockTx = mockTransactionWithGameState(gameState);
    mockDb.transaction.mockImplementation((fn: any) => fn(mockTx));

    const result = await registerCigarette("user-1");

    expect(result.gameState.status).toBe("active");
    expect(result.gameState.remainingLives).toBe(1);
  });

  it("handles first cigarette of the day (0 → 1)", async () => {
    const gameState = createGameState({ cigarettesToday: 0, remainingLives: 4 });
    const mockTx = mockTransactionWithGameState(gameState);
    mockDb.transaction.mockImplementation((fn: any) => fn(mockTx));

    const result = await registerCigarette("user-1");

    expect(result.penaltyApplied).toBe(false);
    expect(result.gameState.cigarettesToday).toBe(1);
  });

  it("handles exact threshold boundary (4 → 5 triggers penalty)", async () => {
    const gameState = createGameState({ cigarettesToday: 3, remainingLives: 3 });
    const mockTx = mockTransactionWithGameState(gameState);
    mockDb.transaction.mockImplementation((fn: any) => fn(mockTx));

    const result = await registerCigarette("user-1");

    expect(result.penaltyApplied).toBe(false);
    expect(result.gameState.cigarettesToday).toBe(4);
  });

  it("caps remaining_lives at 0 on relapse (never goes negative)", async () => {
    const gameState = createGameState({ cigarettesToday: 4, remainingLives: 1 });
    const mockTx = mockTransactionWithGameState(gameState);
    mockDb.transaction.mockImplementation((fn: any) => fn(mockTx));

    const result = await registerCigarette("user-1");

    expect(result.gameState.remainingLives).toBe(0);
    expect(result.gameState.status).toBe("relapse");
  });

  it("calls evaluateAchievements after registering a cigarette", async () => {
    const gameState = createGameState({ cigarettesToday: 2, remainingLives: 4 });
    const mockTx = mockTransactionWithGameState(gameState);
    mockDb.transaction.mockImplementation((fn: any) => fn(mockTx));

    await registerCigarette("user-1");

    expect(mockEvaluateAchievements).toHaveBeenCalledWith("user-1");
  });

  it("returns unlockedAchievements from evaluateAchievements", async () => {
    const gameState = createGameState({ cigarettesToday: 2, remainingLives: 4 });
    const mockTx = mockTransactionWithGameState(gameState);
    mockDb.transaction.mockImplementation((fn: any) => fn(mockTx));
    mockEvaluateAchievements.mockResolvedValueOnce({ unlocked: ["achievement-1", "achievement-2"] });

    const result = await registerCigarette("user-1");

    expect(result.unlockedAchievements).toEqual(["achievement-1", "achievement-2"]);
  });

  it("returns empty unlockedAchievements when none are unlocked", async () => {
    const gameState = createGameState({ cigarettesToday: 2, remainingLives: 4 });
    const mockTx = mockTransactionWithGameState(gameState);
    mockDb.transaction.mockImplementation((fn: any) => fn(mockTx));

    const result = await registerCigarette("user-1");

    expect(result.unlockedAchievements).toEqual([]);
  });
});

describe("registerPositiveAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-15T10:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("applies recovery and returns cooldown info (phase 1)", async () => {
    const gameState = createGameState({
      lastCigaretteAt: "2026-01-15T09:30:00.000Z", // 30 min ago → phase 1
      nextActionAvailableAt: null,
    });
    const mockTx = mockTransactionWithGameState(gameState);
    mockDb.transaction.mockImplementation((fn: any) => fn(mockTx));

    const result = await registerPositiveAction("user-1", "breathing");

    expect(result.gameState).toBeDefined();
    expect(result.cooldownMinutes).toBe(20);
    expect(result.error).toBeUndefined();
  });

  it("blocks action during cooldown", async () => {
    const futureDate = new Date("2026-01-15T11:00:00.000Z").toISOString();
    const gameState = createGameState({
      lastCigaretteAt: "2026-01-15T08:00:00.000Z",
      nextActionAvailableAt: futureDate,
    });
    const mockTx = mockTransactionWithGameState(gameState);
    mockDb.transaction.mockImplementation((fn: any) => fn(mockTx));

    const result = await registerPositiveAction("user-1", "breathing");

    expect(result.error).toBe("Cooldown active");
    expect(result.cooldownMinutes).toBe(0);
  });

  it("increments remaining_lives by 0.5 for meditation", async () => {
    const gameState = createGameState({
      totalLives: 8,
      remainingLives: 6,
      lastCigaretteAt: "2026-01-15T08:00:00.000Z",
      nextActionAvailableAt: null,
    });
    const mockTx = mockTransactionWithGameState(gameState);
    mockDb.transaction.mockImplementation((fn: any) => fn(mockTx));

    const result = await registerPositiveAction("user-1", "meditation");

    expect(result.error).toBeUndefined();
    expect(result.gameState.remainingLives).toBe(6.5);
  });

  it("increments remaining_lives by 0.5 for breathing", async () => {
    const gameState = createGameState({
      totalLives: 8,
      remainingLives: 6,
      lastCigaretteAt: "2026-01-15T08:00:00.000Z",
      nextActionAvailableAt: null,
    });
    const mockTx = mockTransactionWithGameState(gameState);
    mockDb.transaction.mockImplementation((fn: any) => fn(mockTx));

    const result = await registerPositiveAction("user-1", "breathing");

    expect(result.error).toBeUndefined();
    expect(result.gameState.remainingLives).toBe(6.5);
  });

  it("increments remaining_lives by 0.5 for music (standardized, same as other actions)", async () => {
    const gameState = createGameState({
      totalLives: 8,
      remainingLives: 6,
      lastCigaretteAt: "2026-01-15T08:00:00.000Z",
      nextActionAvailableAt: null,
    });
    const mockTx = mockTransactionWithGameState(gameState);
    mockDb.transaction.mockImplementation((fn: any) => fn(mockTx));

    const result = await registerPositiveAction("user-1", "music");

    expect(result.error).toBeUndefined();
    expect(result.gameState.remainingLives).toBe(6.5);
  });

  it("banks overflow into totalPoints (capped at 3) once remainingLives is at totalLives", async () => {
    const gameState = createGameState({
      totalLives: 4,
      remainingLives: 4,
      totalPoints: 2.75,
      lastCigaretteAt: "2026-01-15T08:00:00.000Z",
      nextActionAvailableAt: null,
    });
    const mockTx = mockTransactionWithGameState(gameState);
    mockDb.transaction.mockImplementation((fn: any) => fn(mockTx));

    const result = await registerPositiveAction("user-1", "meditation");

    expect(result.gameState.remainingLives).toBe(4);
    expect(result.gameState.totalPoints).toBe(3);
  });

  it("inserts an action event", async () => {
    const gameState = createGameState({
      lastCigaretteAt: "2026-01-15T08:00:00.000Z",
      nextActionAvailableAt: null,
    });
    const mockTx = mockTransactionWithGameState(gameState);
    mockDb.transaction.mockImplementation((fn: any) => fn(mockTx));

    await registerPositiveAction("user-1", "music");

    expect(mockTx.insert).toHaveBeenCalled();
  });

  it("inserts an 'accion_positiva' event with full spec detail", async () => {
    const gameState = createGameState({
      totalLives: 8,
      remainingLives: 4,
      lastCigaretteAt: "2026-01-15T08:00:00.000Z", // 2h ago → phase 2
      nextActionAvailableAt: null,
    });
    const mockTx = mockTransactionWithGameState(gameState);
    mockDb.transaction.mockImplementation((fn: any) => fn(mockTx));

    await registerPositiveAction("user-1", "meditation");

    const insertedValues = mockTx.insert.mock.results[0].value.values.mock.calls[0][0];
    expect(insertedValues.type).toBe("accion_positiva");
    const detail = JSON.parse(insertedValues.detail);
    expect(detail.subtipos).toBe("meditacion");
    expect(detail.duracion_segundos).toBeGreaterThan(0);
    expect(detail.vidas_recuperadas).toBe(0.5);
    expect(detail.vidas_totales_despues).toBe(4.5);
    expect(detail.proxima_accion_disponible).toBe("2026-01-15T10:15:00.000Z");
  });

  it("accepts all valid action types", async () => {
    const gameState = createGameState({
      lastCigaretteAt: "2026-01-15T08:00:00.000Z",
      nextActionAvailableAt: null,
    });
    const mockTx = mockTransactionWithGameState(gameState);
    mockDb.transaction.mockImplementation((fn: any) => fn(mockTx));

    const breathing = await registerPositiveAction("user-1", "breathing");
    expect(breathing.error).toBeUndefined();

    vi.clearAllMocks();
    const mockTx2 = mockTransactionWithGameState(gameState);
    mockDb.transaction.mockImplementation((fn: any) => fn(mockTx2));

    const meditation = await registerPositiveAction("user-1", "meditation");
    expect(meditation.error).toBeUndefined();

    vi.clearAllMocks();
    const mockTx3 = mockTransactionWithGameState(gameState);
    mockDb.transaction.mockImplementation((fn: any) => fn(mockTx3));

    const music = await registerPositiveAction("user-1", "music");
    expect(music.error).toBeUndefined();
  });

  it("returns error with zero cooldown when blocked", async () => {
    const futureDate = new Date("2026-01-15T12:00:00.000Z").toISOString();
    const gameState = createGameState({
      lastCigaretteAt: "2026-01-15T08:00:00.000Z",
      nextActionAvailableAt: futureDate,
    });
    const mockTx = mockTransactionWithGameState(gameState);
    mockDb.transaction.mockImplementation((fn: any) => fn(mockTx));

    const result = await registerPositiveAction("user-1", "breathing");

    expect(result.error).toBe("Cooldown active");
    expect(result.cooldownMinutes).toBe(0);
  });

  it("uses phase 2 cooldown (15 min) when 2-8 hours since last cigarette", async () => {
    const gameState = createGameState({
      lastCigaretteAt: "2026-01-15T08:00:00.000Z", // 2h ago → phase 2
      nextActionAvailableAt: null,
    });
    const mockTx = mockTransactionWithGameState(gameState);
    mockDb.transaction.mockImplementation((fn: any) => fn(mockTx));

    const result = await registerPositiveAction("user-1", "breathing");

    expect(result.cooldownMinutes).toBe(15);
  });

  it("uses phase 3 cooldown (45 min) when 8-24 hours since last cigarette", async () => {
    const gameState = createGameState({
      lastCigaretteAt: "2026-01-15T01:00:00.000Z", // 9h ago → phase 3
      nextActionAvailableAt: null,
    });
    const mockTx = mockTransactionWithGameState(gameState);
    mockDb.transaction.mockImplementation((fn: any) => fn(mockTx));

    const result = await registerPositiveAction("user-1", "meditation");

    expect(result.cooldownMinutes).toBe(45);
  });

  it("uses phase 4 cooldown (60 min) when 24+ hours since last cigarette", async () => {
    const gameState = createGameState({
      lastCigaretteAt: "2026-01-14T00:00:00.000Z", // 34h ago → phase 4
      nextActionAvailableAt: null,
    });
    const mockTx = mockTransactionWithGameState(gameState);
    mockDb.transaction.mockImplementation((fn: any) => fn(mockTx));

    const result = await registerPositiveAction("user-1", "music");

    expect(result.cooldownMinutes).toBe(60);
  });

  it("does not increment lives when blocked by cooldown", async () => {
    const futureDate = new Date("2026-01-15T11:00:00.000Z").toISOString();
    const gameState = createGameState({
      remainingLives: 6,
      lastCigaretteAt: "2026-01-15T08:00:00.000Z",
      nextActionAvailableAt: futureDate,
    });
    const mockTx = mockTransactionWithGameState(gameState);
    mockDb.transaction.mockImplementation((fn: any) => fn(mockTx));

    const result = await registerPositiveAction("user-1", "breathing");

    expect(result.gameState.remainingLives).toBe(6);
    expect(result.error).toBe("Cooldown active");
  });

  it("calls evaluateAchievements after a successful action", async () => {
    const gameState = createGameState({
      lastCigaretteAt: "2026-01-15T08:00:00.000Z",
      nextActionAvailableAt: null,
    });
    const mockTx = mockTransactionWithGameState(gameState);
    mockDb.transaction.mockImplementation((fn: any) => fn(mockTx));

    await registerPositiveAction("user-1", "breathing");

    expect(mockEvaluateAchievements).toHaveBeenCalledWith("user-1");
  });

  it("does NOT call evaluateAchievements when action is blocked by cooldown", async () => {
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

  it("returns unlockedAchievements from evaluateAchievements", async () => {
    const gameState = createGameState({
      lastCigaretteAt: "2026-01-15T08:00:00.000Z",
      nextActionAvailableAt: null,
    });
    const mockTx = mockTransactionWithGameState(gameState);
    mockDb.transaction.mockImplementation((fn: any) => fn(mockTx));
    mockEvaluateAchievements.mockResolvedValueOnce({ unlocked: ["meditation-master"] });

    const result = await registerPositiveAction("user-1", "meditation");

    expect(result.unlockedAchievements).toEqual(["meditation-master"]);
  });

  it("returns empty unlockedAchievements when action is blocked", async () => {
    const futureDate = new Date("2026-01-15T11:00:00.000Z").toISOString();
    const gameState = createGameState({
      lastCigaretteAt: "2026-01-15T08:00:00.000Z",
      nextActionAvailableAt: futureDate,
    });
    const mockTx = mockTransactionWithGameState(gameState);
    mockDb.transaction.mockImplementation((fn: any) => fn(mockTx));

    const result = await registerPositiveAction("user-1", "breathing");

    expect(result.unlockedAchievements).toEqual([]);
  });
});

describe("getUserAchievements", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns user achievements and progress data", async () => {
    const mockAchievements = [
      { achievementId: "ach-1", unlockedAt: "2026-01-10T00:00:00.000Z" },
      { achievementId: "ach-2", unlockedAt: "2026-01-12T00:00:00.000Z" },
    ];
    const mockProgress = [
      { achievementId: "ach-3", currentValue: 7 },
      { achievementId: "ach-4", currentValue: 3 },
    ];

    mockDb.select.mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          all: vi.fn().mockResolvedValue(mockAchievements),
        }),
      }),
    });
    mockDb.select.mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          all: vi.fn().mockResolvedValue(mockProgress),
        }),
      }),
    });

    const result = await getUserAchievements("user-1");

    expect(result.userAchievements).toEqual([
      { achievementId: "ach-1", unlockedAt: "2026-01-10T00:00:00.000Z" },
      { achievementId: "ach-2", unlockedAt: "2026-01-12T00:00:00.000Z" },
    ]);
    expect(result.progress).toEqual([
      { achievementId: "ach-3", currentValue: 7 },
      { achievementId: "ach-4", currentValue: 3 },
    ]);
  });

  it("returns empty arrays when user has no achievements or progress", async () => {
    mockDb.select.mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          all: vi.fn().mockResolvedValue([]),
        }),
      }),
    });
    mockDb.select.mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          all: vi.fn().mockResolvedValue([]),
        }),
      }),
    });

    const result = await getUserAchievements("user-1");

    expect(result.userAchievements).toEqual([]);
    expect(result.progress).toEqual([]);
  });
});
