const MAX_LIVES = 10;
const MIN_LIVES = 1;
const CIGS_PER_LIFE = 5;

export function computeLives(cigarettesPerDay: number): number {
  const lives = Math.ceil(cigarettesPerDay / CIGS_PER_LIFE);
  return Math.max(MIN_LIVES, Math.min(MAX_LIVES, lives));
}
