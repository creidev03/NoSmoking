"use client";

import { useState, useEffect } from "react";
import type { GameState } from "@/lib/game-state";
import { isCooldownActive, getPhase } from "@/lib/cooldown";

interface UpcomingEventsWidgetProps {
  gameState: GameState;
}

function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m ${secs}s`;
}

export function UpcomingEventsWidget({ gameState }: UpcomingEventsWidgetProps) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Time until midnight reset
  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0);
  const secondsUntilMidnight = Math.max(
    0,
    Math.floor((midnight.getTime() - now) / 1000)
  );

  // Cooldown info
  const cooldownActive = isCooldownActive(gameState.nextActionAvailableAt);
  const cooldownSeconds = cooldownActive
    ? Math.max(
        0,
        Math.floor(
          (new Date(gameState.nextActionAvailableAt!).getTime() - now) / 1000
        )
      )
    : 0;

  const lastCigaretteAt = gameState.lastCigaretteAt
    ? new Date(gameState.lastCigaretteAt)
    : new Date();
  const { phase } = getPhase(lastCigaretteAt, new Date(now));

  return (
    <div className="rounded-xl border border-border bg-surface-card p-4 shadow-[0_1px_3px_rgba(0,0,0,0.1)] dark:border-border dark:bg-surface-card">
      <h2 className="mb-3 text-xs font-medium uppercase tracking-wide text-text-muted">
        📅 Próximos eventos
      </h2>

      <div className="space-y-2">
        {/* Midnight reset */}
        <div className="flex items-center justify-between rounded-lg border border-border p-2 dark:border-border">
          <div className="flex items-center gap-2">
            <span className="text-sm">🌙</span>
            <span className="text-xs font-medium text-text dark:text-text">
              Reset diario
            </span>
          </div>
          <span className="text-xs font-mono text-text-muted">
            {formatTime(secondsUntilMidnight)}
          </span>
        </div>

        {/* Action cooldown */}
        <div className="flex items-center justify-between rounded-lg border border-border p-2 dark:border-border">
          <div className="flex items-center gap-2">
            <span className="text-sm">⏱️</span>
            <span className="text-xs font-medium text-text dark:text-text">
              {cooldownActive ? "Cooldown activo" : "Acción disponible"}
            </span>
          </div>
          <span
            className={`text-xs font-mono ${
              cooldownActive ? "text-warning" : "text-success"
            }`}
          >
            {cooldownActive ? formatTime(cooldownSeconds) : "¡Listo!"}
          </span>
        </div>

        {/* Phase indicator */}
        <div className="flex items-center justify-between rounded-lg border border-border p-2 dark:border-border">
          <div className="flex items-center gap-2">
            <span className="text-sm">🫁</span>
            <span className="text-xs font-medium text-text dark:text-text">
              Fase actual
            </span>
          </div>
          <span className="text-xs font-medium text-text-muted">
            {phase === 1
              ? "Ansiedad inicial"
              : phase === 2
                ? "Inquietud máxima"
                : phase === 3
                  ? "Ansiedad disminuye"
                  : "Recuperación"}
          </span>
        </div>
      </div>
    </div>
  );
}
