"use client";

import type { GameState } from "@/lib/game-state";
import { useTranslations } from "next-intl";

interface ActionButtonsProps {
  onAction: (type: "breathing" | "meditation") => void;
  isCooldownActive: boolean;
  gameState: GameState;
}

export function ActionButtons({
  onAction,
  isCooldownActive,
}: ActionButtonsProps) {
  const t = useTranslations("dashboard.actions");

  const ACTIONS = [
    {
      type: "breathing" as const,
      label: t("breathing"),
      icon: "🫁",
      description: t("livesReward"),
      color: "var(--color-warning)",
    },
    {
      type: "meditation" as const,
      label: t("meditation"),
      icon: "🧘",
      description: t("livesReward"),
      color: "var(--color-accent-purple)",
    },
  ];

  return (
    <div className="rounded-xl border border-border bg-surface-card p-4 shadow-[0_1px_3px_rgba(0,0,0,0.1)] dark:border-border dark:bg-surface-card">
      <h2 className="mb-4 text-xs font-medium uppercase tracking-wide text-text-muted">
        {t("title")}
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
          {t("waitForCooldown")}
        </p>
      )}
    </div>
  );
}
