"use client";

import { useState, useEffect, useRef } from "react";

interface CooldownTimerProps {
  nextActionAt: string | null;
  phase: number;
  onExpired: () => void;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function getPhaseLabel(phase: number): string {
  const labels: Record<number, string> = {
    1: "Ansiedad inicial",
    2: "Inquietud máxima",
    3: "Ansiedad disminuye",
    4: "Recuperación completa",
  };
  return labels[phase] ?? `Fase ${phase}`;
}

function getPhaseColor(phase: number): string {
  const colors: Record<number, string> = {
    1: "var(--color-danger)",
    2: "var(--color-warning)",
    3: "var(--color-info)",
    4: "var(--color-success)",
  };
  return colors[phase] ?? "var(--color-text-muted)";
}

function getPhaseMaxSeconds(phase: number): number {
  const maxSeconds: Record<number, number> = {
    1: 1200, // 20 min
    2: 900,  // 15 min
    3: 2700, // 45 min
    4: 3600, // 60 min
  };
  return maxSeconds[phase] ?? 3600;
}

export function CooldownTimer({
  nextActionAt,
  phase,
  onExpired,
}: CooldownTimerProps) {
  const expiredRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  console.log("CooldownTimer props:", { nextActionAt, phase });

  const [remainingSeconds, setRemainingSeconds] = useState<number>(() => {
    if (!nextActionAt) return 0;
    const diff = new Date(nextActionAt).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / 1000));
  });

  // Single effect: recalculates on nextActionAt change, runs countdown
  useEffect(() => {
    console.log("CooldownTimer effect running, nextActionAt:", nextActionAt);
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    expiredRef.current = false;

    // No cooldown active
    if (!nextActionAt) {
      console.log("CooldownTimer: nextActionAt is null, setting remaining to 0");
      setRemainingSeconds(0);
      return;
    }

    // Calculate remaining seconds from nextActionAt
    const diff = new Date(nextActionAt).getTime() - Date.now();
    const seconds = Math.max(0, Math.ceil(diff / 1000));
    console.log("CooldownTimer: calculated seconds:", seconds);
    setRemainingSeconds(seconds);

    // If already expired, notify
    if (seconds <= 0) {
      console.log("CooldownTimer: ALREADY EXPIRED, calling onExpired");
      onExpired();
      return;
    }

    console.log("CooldownTimer: starting interval for", seconds, "seconds");
    // Start countdown interval
    intervalRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        const next = prev - 1;
        if (next <= 0) {
          console.log("CooldownTimer: interval reached 0, calling onExpired");
          if (intervalRef.current) clearInterval(intervalRef.current);
          intervalRef.current = null;
          // Call onExpired after state update
          setTimeout(() => onExpired(), 0);
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [nextActionAt, onExpired]);

  const isActive = nextActionAt && remainingSeconds > 0;
  const color = getPhaseColor(phase);
  const maxSeconds = getPhaseMaxSeconds(phase);
  const progress = isActive ? remainingSeconds / maxSeconds : 0;
  const circumference = 2 * Math.PI * 26; // 26px radius for 60px diameter

  return (
    <div>
      <h2 className="mb-3 text-xs font-medium uppercase tracking-wide text-text-muted">
        ⏱️ Próxima Acción
      </h2>

      {!isActive ? (
        <div className="flex items-center gap-3">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-full"
            style={{ backgroundColor: `${color}20` }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke={color}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div>
            <p
              data-testid="cooldown-status"
              className="font-medium"
              style={{ color }}
            >
              ¡Listo para la siguiente acción!
            </p>
            <p className="text-sm text-text-muted">{getPhaseLabel(phase)}</p>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <div className="relative flex h-[60px] w-[60px] items-center justify-center">
            {/* Background circle */}
            <svg
              className="h-[60px] w-[60px] -rotate-90"
              viewBox="0 0 60 60"
            >
              <circle
                cx="30"
                cy="30"
                r="26"
                fill="none"
                stroke="var(--color-border)"
                strokeWidth="4"
                className="dark:stroke-border"
              />
              <circle
                cx="30"
                cy="30"
                r="26"
                fill="none"
                stroke={color}
                strokeWidth="4"
                strokeDasharray={circumference}
                strokeDashoffset={circumference * (1 - progress)}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>
            <span
              role="timer"
              aria-label="Cooldown countdown"
              aria-live="polite"
              className="absolute text-sm font-bold text-text dark:text-text"
            >
              {formatTime(remainingSeconds)}
            </span>
          </div>
          <div>
            <p
              data-testid="phase-label"
              className="font-medium"
              style={{ color }}
            >
              {getPhaseLabel(phase)}
            </p>
            <p className="text-sm text-text-muted">Cooldown activo</p>
          </div>
        </div>
      )}
    </div>
  );
}
