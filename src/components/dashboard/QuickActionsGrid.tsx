"use client";

import { useCallback } from "react";

interface QuickActionsGridProps {
  userId: string;
  onAction?: (type: "breathing" | "meditation") => void;
  isCooldownActive?: boolean;
}

const ACTIONS = [
  {
    id: "cigarette",
    icon: "🚬",
    label: "Registrar Cigarro",
    description: "Registrar un cigarrillo fumado",
    color: "var(--color-danger)",
    href: null,
  },
  {
    id: "breathing",
    icon: "🫁",
    label: "Respiración Guiada",
    description: "Ejercicio de respiración calmante",
    color: "var(--color-warning)",
    actionType: "breathing" as const,
    href: null,
  },
  {
    id: "meditation",
    icon: "🧘",
    label: "Meditación",
    description: "Sesión de meditación breve",
    color: "var(--color-accent-purple)",
    actionType: "meditation" as const,
    href: null,
  },
  {
    id: "music",
    icon: "🎵",
    label: "Música Premium",
    description: "Escucha música relajante",
    color: "var(--color-info)",
    href: null,
  },
] as const;

export function QuickActionsGrid({
  onAction,
  isCooldownActive = false,
}: QuickActionsGridProps) {
  const handleClick = useCallback(
    (action: (typeof ACTIONS)[number]) => {
      if ("actionType" in action && action.actionType && onAction) {
        onAction(action.actionType);
      }
    },
    [onAction]
  );

  return (
    <div className="rounded-xl border border-border bg-surface-card p-4 shadow-[0_1px_3px_rgba(0,0,0,0.1)] dark:border-border dark:bg-surface-card">
      <h2 className="mb-3 text-xs font-medium uppercase tracking-wide text-text-muted">
        ⚡ Acciones rápidas
      </h2>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {ACTIONS.map((action) => (
          <button
            key={action.id}
            onClick={() => handleClick(action)}
            disabled={isCooldownActive && "actionType" in action}
            className="group flex flex-col items-center justify-center gap-1 rounded-lg border-2 p-3 transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            style={{
              backgroundColor: `${action.color}10`,
              borderColor: `${action.color}30`,
            }}
            aria-label={action.label}
          >
            <span className="text-2xl">{action.icon}</span>
            <span className="text-[11px] font-medium text-text dark:text-text">
              {action.label}
            </span>
            <span className="hidden text-[10px] text-text-muted sm:block">
              {action.description}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
