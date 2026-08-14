export type Difficulty = "easy" | "medium" | "hard";

export function computeDifficulty(
  smokingYears: number,
  quitAttempts: number
): Difficulty {
  if (smokingYears > 10 || quitAttempts > 3) {
    return "hard";
  }
  if (smokingYears >= 3 || quitAttempts >= 1) {
    return "medium";
  }
  return "easy";
}
