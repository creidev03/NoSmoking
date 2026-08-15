import { useState, useEffect } from "react";

interface StreakDisplayProps {
  streakDays: number;
}

const MESSAGES = [
  { icon: "🏅", text: "¡Sigue así!" },
  { icon: "💪", text: "¡Fuerte!" },
  { icon: "🎯", text: "¡En el objetivo!" },
  { icon: "⭐", text: "¡Increíble!" },
  { icon: "🏆", text: "¡Campeón!" },
  { icon: "🔥", text: "¡Racha larga!" },
];

export function StreakDisplay({ streakDays }: StreakDisplayProps) {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    if (streakDays < 7) return;
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % MESSAGES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [streakDays]);

  const showBadge = streakDays >= 7;
  const currentMessage = MESSAGES[messageIndex];

  return (
    <div className="rounded-xl border border-border bg-surface-card p-4 shadow-[0_1px_3px_rgba(0,0,0,0.1)] dark:border-border dark:bg-surface-card">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-warning/10">
            <span className="text-2xl">🔥</span>
          </div>
          <div>
            <span
              data-testid="streak-days"
              className="text-[32px] font-bold leading-none text-text dark:text-text"
            >
              {streakDays}
            </span>
            <p className="text-sm text-text-muted dark:text-text-muted">
              {streakDays === 1 ? "día sin fumar" : "días sin fumar"}
            </p>
          </div>
        </div>
        {showBadge && (
          <div
            key={messageIndex}
            className="flex items-center gap-1.5 text-xs text-warning animate-pulse"
          >
            <span>{currentMessage.icon}</span>
            <span className="font-medium">{currentMessage.text}</span>
          </div>
        )}
      </div>
    </div>
  );
}
