"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";

interface StreakDisplayProps {
  streakDays: number;
}

export function StreakDisplay({ streakDays }: StreakDisplayProps) {
  const t = useTranslations("dashboard.streak");
  const [messageIndex, setMessageIndex] = useState(0);

  const MESSAGES = t.raw("messages") as { icon: string; text: string }[];

  useEffect(() => {
    if (streakDays < 7) return;
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % MESSAGES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [streakDays, MESSAGES.length]);

  const showBadge = streakDays >= 7;
  const currentMessage = MESSAGES[messageIndex];

  return (
    <div>
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
              {streakDays === 1 ? t("day") : t("days")}
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
