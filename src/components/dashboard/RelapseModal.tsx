"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { RelapseCountdown } from "./RelapseCountdown";
import { RelapseProgress } from "./RelapseProgress";
import { RelapseTips } from "./RelapseTips";
import { registerPositiveAction } from "@/app/[locale]/dashboard/actions";
import { isCooldownActive } from "@/lib/cooldown";
import { type GameState } from "@/lib/game-state";
import { toast } from "sonner";
import { differenceInMinutes } from "date-fns";

interface RelapseModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameState: GameState;
  userId: string;
  onGameStateUpdate?: (newGameState: GameState) => void;
}

interface ActionConfig {
  type: "breathing" | "meditation";
  icon: string;
  name: string;
  livesReward: number;
  durationLabel: string;
}

const ACTIONS: ActionConfig[] = [
  { type: "breathing", icon: "🫁", name: "Respiración", livesReward: 0.5, durationLabel: "12 min" },
  { type: "meditation", icon: "🧘", name: "Meditación", livesReward: 0.5, durationLabel: "12 min" },
];

export function RelapseModal({
  isOpen,
  onClose,
  gameState,
  userId,
  onGameStateUpdate,
}: RelapseModalProps) {
  const [localGameState, setLocalGameState] = useState<GameState>(gameState);
  const [showTips, setShowTips] = useState(false);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const handleAction = useCallback(
    async (actionType: "breathing" | "meditation") => {
      setLoadingAction(actionType);
      try {
        const result = await registerPositiveAction(userId, actionType);
        if (result.error) {
          toast.error("Error al registrar la acción");
          return;
        }
        setLocalGameState(result.gameState);
        onGameStateUpdate?.(result.gameState);
        if (result.gameState.remainingLives > 0) {
          toast.success("¡Recuperaste vidas! Sigue así 💚");
          onClose();
        }
      } catch {
        toast.error("Error inesperado");
      } finally {
        setLoadingAction(null);
      }
    },
    [userId, onClose, onGameStateUpdate]
  );

  const getCooldownMinutes = useCallback(
    (nextActionAt: string | null): number | null => {
      if (!nextActionAt || !isCooldownActive(nextActionAt)) return null;
      return differenceInMinutes(new Date(nextActionAt), new Date());
    },
    []
  );

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4">
        <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-border bg-surface p-6 shadow-lg dark:border-border dark:bg-surface">
          {/* Header */}
          <div className="mb-4 text-center">
            <h2 className="text-2xl font-bold text-warning dark:text-warning">
              ⚠️ RECAÍDA DETECTADA
            </h2>
          </div>

          {/* Empathetic message */}
          <p className="mb-4 text-center text-text dark:text-text">
            No te rindas. Esto es normal.
          </p>
          <p className="mb-6 text-center text-sm text-text-muted dark:text-text-muted">
            Tienes 24 horas para recuperar al menos 1 vida con actividades
            positivas.
          </p>

          {/* Countdown */}
          <div className="mb-6">
            <RelapseCountdown
              startedAt={localGameState.relapseStartedAt || new Date().toISOString()}
              onExpired={onClose}
            />
          </div>

          {/* Progress */}
          <div className="mb-6">
            <RelapseProgress
              currentLives={localGameState.remainingLives}
              targetLives={1}
              totalLives={localGameState.totalLives}
            />
          </div>

          {/* Actions */}
          <div className="mb-6">
            <p className="mb-3 text-sm font-medium text-text dark:text-text">
              ¿Qué hacer ahora?
            </p>
            <div className="space-y-3">
              {ACTIONS.map((action) => {
                const cooldownMins = getCooldownMinutes(
                  localGameState.nextActionAvailableAt
                );
                const isOnCooldown = cooldownMins !== null;
                const isLoading = loadingAction === action.type;

                return (
                  <div
                    key={action.type}
                    className="flex items-center justify-between rounded-xl border border-border bg-surface-card p-3 dark:border-border dark:bg-surface-card"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{action.icon}</span>
                      <div>
                        <p className="text-sm font-medium text-text dark:text-text">
                          {action.name}
                        </p>
                        <p className="text-xs text-text-muted dark:text-text-muted">
                          +{action.livesReward} vidas • {action.durationLabel}
                        </p>
                      </div>
                    </div>
                    {isOnCooldown ? (
                      <span className="text-xs text-warning dark:text-warning">
                        Disponible en {cooldownMins} min
                      </span>
                    ) : (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleAction(action.type)}
                        disabled={isLoading}
                        data-testid={`action-${action.type}`}
                      >
                        {isLoading ? "..." : "INICIAR"}
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Warning */}
          <p className="mb-6 text-center text-xs text-text-muted dark:text-text-muted">
            Si no recuperas en 24h, tu contador de días reinicia.
          </p>

          {/* Footer buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onClose}
              data-testid="understood-button"
            >
              ENTENDIDO
            </Button>
            <Button
              variant="ghost"
              className="flex-1"
              onClick={() => setShowTips(true)}
              data-testid="tips-button"
            >
              💡 TIPS
            </Button>
          </div>
        </div>
      </div>

      {/* Tips modal */}
      <RelapseTips isOpen={showTips} onClose={() => setShowTips(false)} />
    </>
  );
}
