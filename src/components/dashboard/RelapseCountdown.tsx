"use client";

import { useState, useEffect, useCallback } from "react";
import { differenceInSeconds } from "date-fns";
import { cn } from "@/lib/utils";

interface RelapseCountdownProps {
  startedAt: string;
  onExpired: () => void;
}

const RELAPSE_WINDOW_HOURS = 24;
const RELAPSE_WINDOW_SECONDS = RELAPSE_WINDOW_HOURS * 60 * 60;

export function RelapseCountdown({ startedAt, onExpired }: RelapseCountdownProps) {
  const calculateRemaining = useCallback(() => {
    const start = new Date(startedAt);
    const end = new Date(start.getTime() + RELAPSE_WINDOW_SECONDS * 1000);
    const now = new Date();
    const remaining = differenceInSeconds(end, now);
    return Math.max(0, remaining);
  }, [startedAt]);

  const [remaining, setRemaining] = useState(() => calculateRemaining());

  useEffect(() => {
    const interval = setInterval(() => {
      const newRemaining = calculateRemaining();
      setRemaining(newRemaining);
      if (newRemaining <= 0) {
        clearInterval(interval);
        onExpired();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [calculateRemaining, onExpired]);

  const hours = Math.floor(remaining / 3600);
  const minutes = Math.floor((remaining % 3600) / 60);
  const seconds = remaining % 60;

  const timeString = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  const isUrgent = remaining < 3600; // Less than 1 hour

  return (
    <div className="text-center">
      <p className="mb-1 text-sm text-text-muted dark:text-text-muted">
        ⏱️ Tiempo restante:
      </p>
      <p
        data-testid="countdown-display"
        className={cn(
          "text-3xl font-bold tabular-nums text-danger dark:text-danger-soft",
          isUrgent && "animate-pulse"
        )}
      >
        {timeString}
      </p>
    </div>
  );
}
