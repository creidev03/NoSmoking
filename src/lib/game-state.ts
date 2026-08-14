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

export function computeInitialLives(cigarettesPerDay: number): number {
  const lives = Math.floor(cigarettesPerDay / CIGS_PER_LIFE);
  return Math.max(MIN_LIVES, Math.min(MAX_LIVES, lives));
}

export function checkMidnightReset(
  gameState: GameState,
  now: Date
): GameState {
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
