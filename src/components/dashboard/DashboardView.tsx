"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { type GameState } from "@/lib/game-state";
import { isCooldownActive, getPhase } from "@/lib/cooldown";
import { registerPositiveAction } from "@/app/dashboard/actions";
import { LivesDisplay } from "./LivesDisplay";
import { StreakDisplay } from "./StreakDisplay";
import { CigarettesToday } from "./CigarettesToday";
import { CooldownTimer } from "./CooldownTimer";
import { ActionButtons } from "./ActionButtons";
import { BadgesList } from "./BadgesList";
import { RegisterCigaretteModal } from "./RegisterCigaretteModal";

const CACHE_KEY = "dashboard-game-state";

interface Badge {
  key: string;
  unlockedAt: string;
}

interface DashboardViewProps {
  gameState: GameState;
  badges?: Badge[];
}

const CIGARETTE_THRESHOLD = 5;

function loadCachedState(): GameState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed.gameState ?? null;
  } catch {
    return null;
  }
}

function saveCachedState(gameState: GameState) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ gameState, timestamp: new Date().toISOString() })
    );
  } catch {
    // localStorage unavailable — silently skip
  }
}

export function DashboardView({
  gameState,
  badges = [],
}: DashboardViewProps) {
  const [state, setState] = useState(() => {
    const cached = loadCachedState();
    return cached ?? gameState;
  });

  // Sync server state to cache on mount
  useEffect(() => {
    saveCachedState(gameState);
  }, [gameState]);

  const cooldownActive = isCooldownActive(state.nextActionAvailableAt);

  const phase = useMemo(() => {
    if (!state.lastCigaretteAt) return 4;
    return getPhase(new Date(state.lastCigaretteAt), new Date()).phase;
  }, [state.lastCigaretteAt]);

  const handleAction = useCallback(
    async (actionType: "breathing" | "meditation" | "music") => {
      try {
        const result = await registerPositiveAction(state.userId, actionType);
        if (!result.error) {
          setState(result.gameState);
          saveCachedState(result.gameState);
        }
      } catch (err) {
        console.error(`Action failed: ${actionType}`, err);
      }
    },
    [state.userId]
  );

  const handleCooldownExpired = useCallback(() => {
    setState((prev) => ({
      ...prev,
      nextActionAvailableAt: null,
    }));
  }, []);

  const [showCigaretteModal, setShowCigaretteModal] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "warning" } | null>(null);

  const handleCigaretteSuccess = useCallback(
    (newGameState: GameState, penalty: boolean) => {
      setState(newGameState);
      saveCachedState(newGameState);
      setToast({
        message: penalty
          ? "⚠️ Penalización: perdiste 1 vida"
          : "Cigarro registrado",
        type: penalty ? "warning" : "success",
      });
      setTimeout(() => setToast(null), 3000);
    },
    []
  );

  const isRelapsed = state.status === "relapse";

  return (
    <div className="min-h-screen bg-[#FFFFFF] dark:bg-[#111827]">
      <div className="mx-auto max-w-2xl px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-[32px] font-bold leading-tight text-[#1F2937] dark:text-[#F3F4F6]">
            {isRelapsed ? "💚 Recuperación" : "Tu Progreso Hoy"}
          </h1>
          <p className="text-[16px] text-[#6B7280]">
            {isRelapsed
              ? "Estás en ventana de recuperación. ¡No te rindas!"
              : "Cada día es una oportunidad para ser más fuerte"}
          </p>
        </div>

        {/* Relapse banner */}
        {isRelapsed && (
          <div className="mb-4 rounded-xl border border-[#FCA5A5] bg-[#FEF2F2] p-3 dark:border-[#991B1B] dark:bg-[#7F1D1D]/30">
            <p className="text-sm font-medium text-[#991B1B] dark:text-[#FCA5A5]">
              ⚠️ Has perdido todas tus vidas. Tienes 24 horas para recuperarte
              completando acciones positivas.
            </p>
          </div>
        )}

        {/* Register Cigarette Button */}
        <button
          onClick={() => setShowCigaretteModal(true)}
          className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-[#EF4444]/30 bg-[#EF4444]/10 px-4 py-3 text-[15px] font-semibold text-[#EF4444] transition-all active:scale-[0.98] hover:bg-[#EF4444]/15 dark:border-[#EF4444]/20 dark:bg-[#EF4444]/10"
          data-testid="register-cigarette-button"
        >
          🚬 Registrar cigarro
        </button>

        {/* Toast */}
        {toast && (
          <div
            className={`mb-4 rounded-xl px-4 py-3 text-sm font-medium text-center ${
              toast.type === "success"
                ? "border border-[#D1FAE5] bg-[#ECFDF5] text-[#065F46] dark:border-[#065F46] dark:bg-[#065F46]/20 dark:text-[#D1FAE5]"
                : "border border-[#FCA5A5] bg-[#FEF2F2] text-[#991B1B] dark:border-[#991B1B] dark:bg-[#991B1B]/20 dark:text-[#FCA5A5]"
            }`}
          >
            {toast.message}
          </div>
        )}

        {/* Main content - single column on mobile */}
        <div className="space-y-3">
          <LivesDisplay
            total={state.totalLives}
            remaining={state.remainingLives}
          />

          {state.totalPoints > 0 && (
            <p
              data-testid="extra-points"
              className="text-sm text-[#6B7280]"
            >
              🎁 Vidas extra ganadas: {state.totalPoints}/3
            </p>
          )}

          <StreakDisplay streakDays={state.streakDays} />

          <CigarettesToday
            count={state.cigarettesToday}
            threshold={CIGARETTE_THRESHOLD}
          />

          <CooldownTimer
            nextActionAt={state.nextActionAvailableAt}
            phase={phase}
            onExpired={handleCooldownExpired}
          />

          <ActionButtons
            onAction={handleAction}
            isCooldownActive={cooldownActive}
            gameState={state}
          />

          <BadgesList badges={badges} />
        </div>
      </div>

      <RegisterCigaretteModal
        isOpen={showCigaretteModal}
        onClose={() => setShowCigaretteModal(false)}
        userId={state.userId}
        onSuccess={handleCigaretteSuccess}
      />
    </div>
  );
}
