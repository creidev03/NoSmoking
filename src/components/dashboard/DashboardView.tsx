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

        {/* Main content - single column on mobile */}
        <div className="space-y-3">
          <LivesDisplay
            total={state.totalLives}
            remaining={state.remainingLives}
          />

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
    </div>
  );
}
