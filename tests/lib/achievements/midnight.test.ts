import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock evaluateAchievements at the top level
const { mockEvaluateAchievements } = vi.hoisted(() => ({
  mockEvaluateAchievements: vi.fn().mockResolvedValue({ unlocked: [] }),
}));
vi.mock("@/lib/achievements", () => ({
  evaluateAchievements: mockEvaluateAchievements,
}));

// Mock getUserAchievements
const { mockGetUserAchievements } = vi.hoisted(() => ({
  mockGetUserAchievements: vi.fn().mockResolvedValue({
    userAchievements: [],
    progress: [],
  }),
}));

// Mock db
const { mockDb } = vi.hoisted(() => ({
  mockDb: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          get: vi.fn(() => Promise.resolve(null)),
          all: vi.fn(() => Promise.resolve([])),
        })),
      })),
    })),
    insert: vi.fn(() => ({
      values: vi.fn(() => Promise.resolve([])),
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(() => Promise.resolve()),
      })),
    })),
    transaction: vi.fn(),
  },
}));
vi.mock("@/lib/db", () => ({ db: mockDb }));

vi.mock("@/app/dashboard/actions", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/app/dashboard/actions")>();
  return {
    ...original,
    getUserAchievements: mockGetUserAchievements,
  };
});

import { checkMidnightReset, type GameState } from "@/lib/game-state";
import { processMidnightReset } from "@/app/dashboard/actions";

function makeGameState(overrides: Partial<GameState> = {}): GameState {
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
    updatedAt: "2026-01-14T23:59:00.000Z",
    ...overrides,
  };
}

function createMockTx(gameState: any, existingBadges: string[] = []) {
  return {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          get: vi.fn(() => Promise.resolve(gameState)),
          all: vi.fn(() =>
            Promise.resolve(
              existingBadges.map((key) => ({ badgeKey: key }))
            )
          ),
        })),
      })),
    })),
    insert: vi.fn(() => ({
      values: vi.fn(() => Promise.resolve([])),
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(() => Promise.resolve()),
      })),
    })),
  };
}

describe("Midnight reset + achievement evaluation integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockEvaluateAchievements.mockResolvedValue({ unlocked: [] });
    mockGetUserAchievements.mockResolvedValue({
      userAchievements: [],
      progress: [],
    });
  });

  it("checkMidnightReset detects streak increment", () => {
    const gs = makeGameState({
      streakDays: 6,
      cigarettesToday: 2,
      updatedAt: "2026-01-14T23:59:00.000Z",
    });
    const now = new Date("2026-01-15T00:01:00.000Z");

    const result = checkMidnightReset(gs, now);

    expect(result.gameState.streakDays).toBe(7);
    expect(result.gameState.cigarettesToday).toBe(0);
  });

  it("checkMidnightReset does not increment streak if user smoked too much", () => {
    const gs = makeGameState({
      streakDays: 6,
      cigarettesToday: 5,
      updatedAt: "2026-01-14T23:59:00.000Z",
    });
    const now = new Date("2026-01-15T00:01:00.000Z");

    const result = checkMidnightReset(gs, now);

    expect(result.gameState.streakDays).toBe(0);
  });

  it("processMidnightReset calls evaluateAchievements", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-15T10:00:00.000Z"));

    const gameState = createMockTx({
      id: "gs-1",
      userId: "user-1",
      streakDays: 6,
      totalLives: 4,
      remainingLives: 4,
      cigarettesToday: 2,
      totalCigarettesAllTime: 0,
      consecutiveSmokingDays: 0,
      totalPoints: 0,
      status: "active",
      relapseStartedAt: null,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-14T23:59:00.000Z",
    });

    mockDb.transaction.mockImplementation((fn: any) => fn(gameState));

    await processMidnightReset("user-1");

    expect(mockEvaluateAchievements).toHaveBeenCalledWith("user-1");

    vi.useRealTimers();
  });

  it("processMidnightReset returns gameState and achievements", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-15T10:00:00.000Z"));

    const gameState = createMockTx({
      id: "gs-1",
      userId: "user-1",
      streakDays: 6,
      totalLives: 4,
      remainingLives: 4,
      cigarettesToday: 2,
      totalCigarettesAllTime: 0,
      consecutiveSmokingDays: 0,
      totalPoints: 0,
      status: "active",
      relapseStartedAt: null,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-14T23:59:00.000Z",
    });

    mockDb.transaction.mockImplementation((fn: any) => fn(gameState));

    const result = await processMidnightReset("user-1");

    expect(result).toHaveProperty("gameState");
    expect(result).toHaveProperty("achievements");
    expect(result.achievements).toHaveProperty("userAchievements");
    expect(result.achievements).toHaveProperty("progress");

    vi.useRealTimers();
  });

  it("processMidnightReset persists the reset when a new day is detected", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-15T10:00:00.000Z"));

    const gameState = createMockTx({
      id: "gs-1",
      userId: "user-1",
      streakDays: 6,
      totalLives: 4,
      remainingLives: 4,
      cigarettesToday: 2,
      totalCigarettesAllTime: 0,
      consecutiveSmokingDays: 0,
      totalPoints: 0,
      status: "active",
      relapseStartedAt: null,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-14T23:59:00.000Z",
    });

    mockDb.transaction.mockImplementation((fn: any) => fn(gameState));

    const result = await processMidnightReset("user-1");

    // Streak should be incremented (6 → 7)
    expect(result.gameState.streakDays).toBe(7);
    expect(result.gameState.cigarettesToday).toBe(0);

    vi.useRealTimers();
  });

  it("processMidnightReset does not persist when no reset is needed", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-15T10:00:00.000Z"));

    // updatedAt is today — no reset needed
    const gameState = createMockTx({
      id: "gs-1",
      userId: "user-1",
      streakDays: 7,
      totalLives: 4,
      remainingLives: 4,
      cigarettesToday: 0,
      totalCigarettesAllTime: 0,
      consecutiveSmokingDays: 0,
      totalPoints: 0,
      status: "active",
      relapseStartedAt: null,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-15T10:00:00.000Z",
    });

    mockDb.transaction.mockImplementation((fn: any) => fn(gameState));

    const result = await processMidnightReset("user-1");

    // No change — streak stays the same
    expect(result.gameState.streakDays).toBe(7);
    expect(result.gameState.cigarettesToday).toBe(0);

    vi.useRealTimers();
  });
});
