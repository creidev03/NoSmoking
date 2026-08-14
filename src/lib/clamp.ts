function clamp(value: number, max: number): number {
  return Math.max(0, Math.min(max, Math.floor(value)));
}

export function clampCigarettesPerDay(value: number): number {
  return clamp(value, 100);
}

export function clampSmokingYears(value: number): number {
  return clamp(value, 60);
}

export function clampQuitAttempts(value: number): number {
  return clamp(value, 50);
}
