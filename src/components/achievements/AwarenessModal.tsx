"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import type { Achievement } from "@/lib/achievements/types";
import { Button } from "@/components/ui/button";

const AUTO_DISMISS_SECONDS = 10;

interface AwarenessModalProps {
  achievement: Achievement | null;
  isOpen: boolean;
  onClose: () => void;
  message: string;
}

export function AwarenessModal({
  achievement,
  isOpen,
  onClose,
  message,
}: AwarenessModalProps) {
  const [secondsLeft, setSecondsLeft] = useState(AUTO_DISMISS_SECONDS);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const cleanup = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Auto-dismiss countdown
  useEffect(() => {
    if (!isOpen) {
      cleanup();
      setSecondsLeft(AUTO_DISMISS_SECONDS);
      return;
    }

    setSecondsLeft(AUTO_DISMISS_SECONDS);

    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          cleanup();
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return cleanup;
  }, [isOpen, onClose, cleanup]);

  if (!isOpen || !achievement) return null;

  return (
    <div
      data-testid="awareness-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-label={achievement.name}
        className={cn(
          "relative mx-4 w-full max-w-sm rounded-2xl border p-6 shadow-xl",
          "border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-950/60"
        )}
      >
        {/* Warning icon */}
        <div className="mb-4 text-center text-5xl">⚠️</div>

        {/* Name */}
        <h2 className="text-center text-lg font-bold text-amber-900 dark:text-amber-200">
          {achievement.name}
        </h2>

        {/* Awareness message */}
        <p className="mt-3 text-center text-sm leading-relaxed text-amber-800 dark:text-amber-300">
          {message}
        </p>

        {/* Countdown + manual dismiss */}
        <div className="mt-6 flex flex-col items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400">
            <span>Auto-cierre en</span>
            <span
              className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-200 text-xs font-bold text-amber-900 dark:bg-amber-800 dark:text-amber-100"
              aria-live="polite"
            >
              {secondsLeft}
            </span>
            <span>segundos</span>
          </div>
          <Button
            variant="outline"
            className="border-amber-400 bg-amber-100 text-amber-900 hover:bg-amber-200 dark:border-amber-600 dark:bg-amber-900 dark:text-amber-200 dark:hover:bg-amber-800"
            onClick={onClose}
          >
            ENTENDIDO
          </Button>
        </div>
      </div>
    </div>
  );
}
