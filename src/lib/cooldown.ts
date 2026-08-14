export interface PhaseResult {
  phase: number;
  cooldownMinutes: number;
}

const PHASE_CONFIG: Record<number, number> = {
  1: 20,
  2: 15,
  3: 45,
  4: 60,
};

const PHASE_BOUNDARIES_HOURS = [0, 2, 8, 24];

export function getPhase(
  lastCigaretteAt: Date,
  now: Date
): PhaseResult {
  const diffMs = now.getTime() - lastCigaretteAt.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  let phase: number;
  if (diffHours < PHASE_BOUNDARIES_HOURS[1]) {
    phase = 1;
  } else if (diffHours < PHASE_BOUNDARIES_HOURS[2]) {
    phase = 2;
  } else if (diffHours < PHASE_BOUNDARIES_HOURS[3]) {
    phase = 3;
  } else {
    phase = 4;
  }

  return {
    phase,
    cooldownMinutes: PHASE_CONFIG[phase],
  };
}

export function getNextActionAvailableAt(
  lastActionAt: Date,
  cooldownMinutes: number
): string {
  const next = new Date(lastActionAt.getTime() + cooldownMinutes * 60 * 1000);
  return next.toISOString();
}

export function isCooldownActive(
  nextActionAvailableAt: string | null
): boolean {
  if (!nextActionAvailableAt) return false;
  return new Date(nextActionAvailableAt).getTime() > Date.now();
}
