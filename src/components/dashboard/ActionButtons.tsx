"use client";

import type { GameState } from "@/lib/game-state";

interface ActionButtonsProps {
  onAction: (type: "breathing" | "meditation") => void;
  isCooldownActive: boolean;
  gameState: GameState;
}

const ACTIONS = [
  {
    type: "breathing" as const,
    label: "Respiración",
    icon: "🫁",
    description: "+0.5 vidas",
    color: "var(--color-warning)",
  },
  {
    type: "meditation" as const,
    label: "Meditación",
    icon: "🧘",
    description: "+0.5 vidas",
    color: "var(--color-accent-purple)",
  },
] as const;

export function ActionButtons({
  onAction,
  isCooldownActive,
}: ActionButtonsProps) {
  return (
    <div className="rounded-xl border border-border bg-surface-card p-4 shadow-[0_1px_3px_rgba(0,0,0,0.1)] dark:border-border dark:bg-surface-card">
      <h2 className="mb-4 text-xs font-medium uppercase tracking-wide text-text-muted">
        🫁 Actividades Positivas
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {ACTIONS.map((action) => (
          <button
            key={action.type}
            onClick={() => onAction(action.type)}
            disabled={isCooldownActive}
            aria-label={action.label}
            data-testid={`action-${action.type}`}
            className={`group flex h-[48px] flex-col items-center justify-center rounded-lg border-2 transition-all ${
              isCooldownActive
                ? "cursor-not-allowed border-border bg-surface opacity-50 dark:border-border dark:bg-surface"
                : "active:scale-95"
            }`}
            style={
              !isCooldownActive
                ? {
                    backgroundColor: `${action.color}15`,
                    borderColor: `${action.color}40`,
                    color: action.color,
                  }
                : undefined
            }
          >
            <span className="text-xl">{action.icon}</span>
            <span className="text-[10px] font-medium">{action.label}</span>
          </button>
        ))}
      </div>
      {isCooldownActive && (
        <p className="mt-3 text-center text-sm text-text-muted">
          ⏳ Espera a que termine el cooldown
        </p>
      )}
    </div>
  );
}
