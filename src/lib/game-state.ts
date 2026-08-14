export interface GameState {
  id: string;
  userId: string;
  totalLives: number;
  remainingLives: number;
  cigarettesToday: number;
  streakDays: number;
  lastCigaretteAt: string | null;
  lastActionAt: string | null;
  nextActionAvailableAt: string | null;
  status: string;
  relapseStartedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

const MAX_LIVES = 10;
const MIN_LIVES = 1;
const CIGS_PER_LIFE = 5;
const RELAPSE_WINDOW_HOURS = 24;

export function computeInitialLives(cigarettesPerDay: number): number {
  const lives = Math.floor(cigarettesPerDay / CIGS_PER_LIFE);
  return Math.max(MIN_LIVES, Math.min(MAX_LIVES, lives));
}

export function checkMidnightReset(
  gameState: GameState,
  now: Date
): GameState {
  // Check relapse window expiration first
  if (
    gameState.status === "relapse" &&
    checkRelapseWindowExpired(gameState, now)
  ) {
    return {
      ...gameState,
      status: "active",
      relapseStartedAt: null,
      cigarettesToday: 0,
      streakDays: 0,
      updatedAt: now.toISOString(),
    };
  }

  const lastUpdate = new Date(gameState.updatedAt);
  const lastUpdateDate = lastUpdate.toISOString().split("T")[0];
  const nowDate = now.toISOString().split("T")[0];

  if (lastUpdateDate === nowDate) {
    return gameState;
  }

  const newStreakDays =
    gameState.cigarettesToday < CIGS_PER_LIFE
      ? gameState.streakDays + 1
      : 0;

  return {
    ...gameState,
    streakDays: newStreakDays,
    cigarettesToday: 0,
    updatedAt: now.toISOString(),
  };
}

export function checkRelapseWindowExpired(
  gameState: GameState,
  now: Date
): boolean {
  if (!gameState.relapseStartedAt) return false;

  const relapseStart = new Date(gameState.relapseStartedAt);
  const windowEnd = new Date(
    relapseStart.getTime() + RELAPSE_WINDOW_HOURS * 60 * 60 * 1000
  );

  return now.getTime() >= windowEnd.getTime();
}
