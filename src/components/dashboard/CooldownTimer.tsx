"use client";

import { useState, useEffect, useCallback, useRef } from "react";

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
    1: "#EF4444", // Rojo Suave
    2: "#F97316", // Naranja Energía
    3: "#3B82F6", // Azul Calma
    4: "#10B981", // Verde Esperanza
  };
  return colors[phase] ?? "#6B7280";
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

  const [remainingSeconds, setRemainingSeconds] = useState<number>(() => {
    if (!nextActionAt) return 0;
    const diff = new Date(nextActionAt).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / 1000));
  });

  // Recalculate when nextActionAt changes (e.g. after a positive action)
  useEffect(() => {
    if (!nextActionAt) {
      setRemainingSeconds(0);
      return;
    }
    const diff = new Date(nextActionAt).getTime() - Date.now();
    setRemainingSeconds(Math.max(0, Math.ceil(diff / 1000)));
    expiredRef.current = false;
  }, [nextActionAt]);

  const handleExpired = useCallback(() => {
    if (!expiredRef.current) {
      expiredRef.current = true;
      onExpired();
    }
  }, [onExpired]);

  useEffect(() => {
    expiredRef.current = false;

    if (remainingSeconds <= 0) {
      if (nextActionAt) handleExpired();
      return;
    }

    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [nextActionAt, handleExpired, remainingSeconds > 0]);

  useEffect(() => {
    if (remainingSeconds <= 0 && nextActionAt) {
      handleExpired();
    }
  }, [remainingSeconds, nextActionAt, handleExpired]);

  const isActive = nextActionAt && remainingSeconds > 0;
  const color = getPhaseColor(phase);
  const maxSeconds = getPhaseMaxSeconds(phase);
  const progress = isActive ? remainingSeconds / maxSeconds : 0;
  const circumference = 2 * Math.PI * 26; // 26px radius for 60px diameter

  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-4 shadow-[0_1px_3px_rgba(0,0,0,0.1)] dark:border-[#374151] dark:bg-[#1F2937]">
      <h2 className="mb-3 text-xs font-medium uppercase tracking-wide text-[#6B7280]">
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
            <p className="text-sm text-[#6B7280]">{getPhaseLabel(phase)}</p>
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
                stroke="#E5E7EB"
                strokeWidth="4"
                className="dark:stroke-[#374151]"
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
              className="absolute text-sm font-bold text-[#1F2937] dark:text-[#F3F4F6]"
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
            <p className="text-sm text-[#6B7280]">Cooldown activo</p>
          </div>
        </div>
      )}
    </div>
  );
}
