export interface BadgeThreshold {
  key: string;
  days: number;
}

const BADGE_THRESHOLDS: BadgeThreshold[] = [
  { key: "primera_semana", days: 7 },
  { key: "un_mes", days: 30 },
  { key: "centenario", days: 100 },
  { key: "un_ano", days: 365 },
];

export function evaluateBadges(
  streakDays: number,
  existingBadges: string[]
): string[] {
  const newBadges: string[] = [];

  for (const threshold of BADGE_THRESHOLDS) {
    if (
      streakDays >= threshold.days &&
      !existingBadges.includes(threshold.key)
    ) {
      newBadges.push(threshold.key);
    }
  }

  return newBadges;
}
