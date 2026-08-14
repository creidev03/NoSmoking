const NOTIFICATION_MOTIVATIONS = new Set([
  "health",
  "family",
  "money",
  "appearance",
]);

export function shouldEnableNotifications(motivation: string): boolean {
  return NOTIFICATION_MOTIVATIONS.has(motivation);
}
