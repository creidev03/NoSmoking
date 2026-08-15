"use client";

import { cn } from "@/lib/utils";

interface RelapseProgressProps {
  currentLives: number;
  targetLives: number;
  totalLives: number;
}

export function RelapseProgress({
  currentLives,
  targetLives,
  totalLives,
}: RelapseProgressProps) {
  const recovered = currentLives;
  const needed = targetLives;
  const remaining = Math.max(0, needed - recovered);

  const blocks = [];
  for (let i = 0; i < totalLives; i++) {
    blocks.push(
      <span
        key={i}
        data-testid={`life-block-${i}`}
        className={cn(
          "inline-block h-5 w-5 rounded-sm transition-all duration-300",
          i < recovered
            ? "bg-success dark:bg-success-soft"
            : "bg-border dark:bg-border"
        )}
      />
    );
  }

  return (
    <div className="rounded-xl border border-border bg-surface-card p-4 dark:border-border dark:bg-surface-card">
      <p className="mb-2 text-sm font-medium text-text dark:text-text">
        Progreso de recuperación:
      </p>
      <div className="flex items-center gap-2">
        <div className="flex gap-1" data-testid="progress-blocks">
          {blocks}
          <span className="text-sm text-text-muted dark:text-text-muted">
            {recovered}/{totalLives}
            {remaining > 0 && (
              <span className="text-text-muted dark:text-text-muted">
                {" "}
                ({remaining} más)
              </span>
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
