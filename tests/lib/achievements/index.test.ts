import { describe, it, expect, vi, beforeEach } from "vitest";

// Track sequential query results for the mock db
let queryResults: any[][] = [];
let queryIndex = 0;

vi.mock("@/lib/db", () => {
  const createChain = () => {
    const chain: any = {
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      values: vi.fn().mockResolvedValue([]),
      update: vi.fn().mockReturnThis(),
      set: vi.fn().mockReturnThis(),
      then: (resolve: any, reject?: any) => {
        const result = queryResults[queryIndex] ?? [];
        queryIndex++;
        return Promise.resolve(result).then(resolve, reject);
      },
    };
    return chain;
  };

  return {
    db: createChain(),
  };
});

vi.mock("@/lib/achievements/progress", () => ({
  getProgress: vi.fn(),
  updateProgress: vi.fn(),
  incrementProgress: vi.fn(),
}));

vi.mock("@/lib/achievements/seed", () => ({
  ACHIEVEMENT_SEEDS: [
    {
      id: "T001",
      name: "Primera Semana",
      icon: "🔥",
      category: "time",
      difficulty: "easy",
      isSecret: false,
      description: "7 días sin fumar",
      conditionType: "streak_days",
      conditionValue: "7",
    },
    {
      id: "T002",
      name: "Dos Semanas",
      icon: "🌟",
      category: "time",
      difficulty: "easy",
      isSecret: false,
      description: "14 días de racha",
      conditionType: "streak_days",
      conditionValue: "14",
    },
    {
      id: "P001",
      name: "Primer Cigarrillo Evitado",
      icon: "🚫",
      category: "progress",
      difficulty: "easy",
      isSecret: false,
      description: "Evitaste tu primer cigarrillo",
      conditionType: "milestones",
      conditionValue: "1",
    },
    {
      id: "A001",
      name: "Primera Acción Positiva",
      icon: "🎯",
      category: "actions",
      difficulty: "easy",
      isSecret: false,
      description: "Primera acción positiva",
      conditionType: "total_actions",
      conditionValue: "1",
    },
  ],
}));

import { db } from "@/lib/db";
import { getProgress, updateProgress, incrementProgress } from "@/lib/achievements/progress";
import { evaluateAchievements } from "@/lib/achievements/index";

const mockGetProgress = vi.mocked(getProgress);
const mockUpdateProgress = vi.mocked(updateProgress);
const mockIncrementProgress = vi.mocked(incrementProgress);

describe("evaluateAchievements", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryResults = [];
    queryIndex = 0;
  });

  it("unlocks achievements when conditions are met", async () => {
    // Setup: game_state, events, userAchievements queries
    queryResults = [
      [{ id: "gs-1", userId: "user-1", streakDays: 7, totalLives: 4, remainingLives: 4, cigarettesToday: 0, totalCigarettesAllTime: 14, consecutiveSmokingDays: 0, totalPoints: 70 }],
      [], // events
      [], // userAchievements
    ];
    mockGetProgress.mockResolvedValue(0);

    const result = await evaluateAchievements("user-1");

    expect(result.unlocked).toContain("T001");
  });

  it("skips already unlocked achievements", async () => {
    queryResults = [
      [{ id: "gs-1", userId: "user-1", streakDays: 7, totalLives: 4, remainingLives: 4, cigarettesToday: 0, totalCigarettesAllTime: 14, consecutiveSmokingDays: 0, totalPoints: 70 }],
      [],
      [{ achievementId: "T001" }],
    ];
    mockGetProgress.mockResolvedValue(0);

    const result = await evaluateAchievements("user-1");

    expect(result.unlocked).not.toContain("T001");
  });

  it("does not unlock achievements when conditions are not met", async () => {
    queryResults = [
      [{ id: "gs-1", userId: "user-1", streakDays: 3, totalLives: 0, remainingLives: 4, cigarettesToday: 0, totalCigarettesAllTime: 6, consecutiveSmokingDays: 0, totalPoints: 30 }],
      [],
      [],
    ];
    mockGetProgress.mockResolvedValue(0);

    const result = await evaluateAchievements("user-1");

    expect(result.unlocked).not.toContain("T001");
    expect(result.unlocked).not.toContain("T002");
  });

  it("updates progress for each achievement", async () => {
    queryResults = [
      [{ id: "gs-1", userId: "user-1", streakDays: 3, totalLives: 0, remainingLives: 4, cigarettesToday: 0, totalCigarettesAllTime: 6, consecutiveSmokingDays: 0, totalPoints: 30 }],
      [],
      [],
    ];
    mockGetProgress.mockResolvedValue(0);

    await evaluateAchievements("user-1");

    // Should call updateProgress for each of 4 achievements
    expect(mockUpdateProgress).toHaveBeenCalledTimes(4);
  });

  it("increments progress for achievements already tracked", async () => {
    queryResults = [
      [{ id: "gs-1", userId: "user-1", streakDays: 3, totalLives: 0, remainingLives: 4, cigarettesToday: 0, totalCigarettesAllTime: 6, consecutiveSmokingDays: 0, totalPoints: 30 }],
      [],
      [],
    ];

    // T001 already has progress 2/7
    mockGetProgress.mockResolvedValueOnce(2); // T001
    mockGetProgress.mockResolvedValueOnce(0); // T002
    mockGetProgress.mockResolvedValueOnce(0); // P001
    mockGetProgress.mockResolvedValueOnce(0); // A001

    await evaluateAchievements("user-1");

    // T001 has progress → incrementProgress called
    expect(mockIncrementProgress).toHaveBeenCalledWith("user-1", "T001");
    // Others have 0 progress → updateProgress called
    expect(mockUpdateProgress).toHaveBeenCalledTimes(3);
  });

  it("returns empty array when no achievements unlock", async () => {
    queryResults = [
      [{ id: "gs-1", userId: "user-1", streakDays: 0, totalLives: 0, remainingLives: 4, cigarettesToday: 0, totalCigarettesAllTime: 0, consecutiveSmokingDays: 0, totalPoints: 0 }],
      [],
      [],
    ];
    mockGetProgress.mockResolvedValue(0);

    const result = await evaluateAchievements("user-1");

    expect(result.unlocked).toEqual([]);
  });
});
