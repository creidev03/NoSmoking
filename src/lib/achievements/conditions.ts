export interface ConditionResult {
  met: boolean;
  progress: number;
}

export function checkStreakDays(
  streakDays: number,
  target: number
): ConditionResult {
  if (target === 0) return { met: true, progress: 1 };
  return {
    met: streakDays >= target,
    progress: Math.min(streakDays / target, 1),
  };
}

export function checkTotalActions(
  events: Array<{ type: string }>,
  actionType: string,
  target: number
): ConditionResult {
  const count = events.filter((e) => e.type === actionType).length;
  if (target === 0) return { met: true, progress: 1 };
  return {
    met: count >= target,
    progress: Math.min(count / target, 1),
  };
}

export function checkMilestone(
  value: number,
  target: number
): ConditionResult {
  if (target === 0) return { met: true, progress: 1 };
  return {
    met: value >= target,
    progress: Math.min(value / target, 1),
  };
}

export function checkTimeRange(
  hour: number,
  start: number,
  end: number
): ConditionResult {
  let inRange: boolean;
  if (start <= end) {
    // Normal range: e.g. 8-18
    inRange = hour >= start && hour <= end;
  } else {
    // Wraps midnight: e.g. 22-6
    inRange = hour >= start || hour <= end;
  }
  return { met: inRange, progress: inRange ? 1 : 0 };
}

export function checkConsecutiveDaysAction(
  events: Array<{ type: string; createdAt: string }>,
  actionType: string,
  days: number
): ConditionResult {
  if (days === 0) return { met: true, progress: 1 };
  if (events.length === 0) return { met: false, progress: 0 };

  // Get unique days with matching events
  const matchingDays = new Set(
    events
      .filter((e) => e.type === actionType)
      .map((e) => e.createdAt.split("T")[0])
  );

  if (matchingDays.size === 0) {
    return { met: false, progress: 0 };
  }

  // Sort days descending and count consecutive from today backwards
  const sortedDays = Array.from(matchingDays).sort().reverse();
  let consecutive = 1;

  for (let i = 0; i < sortedDays.length - 1; i++) {
    const current = new Date(sortedDays[i]);
    const prev = new Date(sortedDays[i + 1]);
    const diffMs = current.getTime() - prev.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      consecutive++;
    } else {
      break;
    }
  }

  return {
    met: consecutive >= days,
    progress: Math.min(consecutive / days, 1),
  };
}

export function checkCollection(
  unlockedInCategory: number,
  totalInCategory: number
): ConditionResult {
  if (totalInCategory === 0) return { met: true, progress: 1 };
  return {
    met: unlockedInCategory >= totalInCategory,
    progress: Math.min(unlockedInCategory / totalInCategory, 1),
  };
}

export function checkNoPenalties(
  events: Array<{ type: string; createdAt: string }>,
  days: number,
  now: Date = new Date()
): ConditionResult {
  const cutoffMs = now.getTime() - days * 24 * 60 * 60 * 1000;

  const hasPenalty = events.some(
    (e) =>
      e.type === "penalty" && new Date(e.createdAt).getTime() >= cutoffMs
  );

  return { met: !hasPenalty, progress: hasPenalty ? 0 : 1 };
}

export function checkPhaseActions(
  events: Array<{ type: string; detail?: string | null; createdAt: string }>,
  phase: string,
  count: number
): ConditionResult {
  if (count === 0) return { met: true, progress: 1 };

  const matching = events.filter(
    (e) => e.detail != null && e.detail.includes(phase)
  ).length;

  return {
    met: matching >= count,
    progress: Math.min(matching / count, 1),
  };
}
