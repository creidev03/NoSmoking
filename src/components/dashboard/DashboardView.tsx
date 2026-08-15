"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { type GameState } from "@/lib/game-state";
import { isCooldownActive, getPhase } from "@/lib/cooldown";
import { registerPositiveAction, registerCigarette, devResetLives, devRemoveCooldown } from "@/app/dashboard/actions";
import { LivesDisplay } from "./LivesDisplay";
import { StreakDisplay } from "./StreakDisplay";
import { CigarettesToday } from "./CigarettesToday";
import { CooldownTimer } from "./CooldownTimer";
import { ActionButtons } from "./ActionButtons";
import { AchievementGallery } from "@/components/achievements/AchievementGallery";
import { AchievementModal } from "@/components/achievements/AchievementModal";
import { AwarenessModal } from "@/components/achievements/AwarenessModal";
import { generateAwarenessMessage } from "@/lib/achievements/awareness-messages";
import type { Achievement } from "@/lib/achievements/types";
import { CigaretteButton } from "./CigaretteButton";


const CACHE_KEY = "dashboard-game-state";

interface Badge {
  key: string;
  unlockedAt: string;
}

interface UserAchievement {
  achievementId: string;
  unlockedAt: string;
}

interface AchievementProgress {
  achievementId: string;
  currentValue: number;
}

interface DashboardViewProps {
  gameState: GameState;
  badges?: Badge[];
  achievements?: Achievement[];
  userAchievements?: UserAchievement[];
  progress?: AchievementProgress[];
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
  achievements = [],
  userAchievements = [],
  progress = [],
}: DashboardViewProps) {
  const [state, setState] = useState(() => {
    const cached = loadCachedState();
    return cached ?? gameState;
  });

  const [userAchievementsState, setUserAchievementsState] = useState<UserAchievement[]>(userAchievements);
  const [progressState, setProgressState] = useState<AchievementProgress[]>(progress);

  // Queue for unlocked achievements to show modals
  const [unlockQueue, setUnlockQueue] = useState<Achievement[]>([]);
  const [isProcessingQueue, setIsProcessingQueue] = useState(false);

  // Sync server state to cache on mount
  useEffect(() => {
    saveCachedState(gameState);
  }, [gameState]);

  const cooldownActive = isCooldownActive(state.nextActionAvailableAt);

  const phase = useMemo(() => {
    if (!state.lastCigaretteAt) return 4;
    return getPhase(new Date(state.lastCigaretteAt), new Date()).phase;
  }, [state.lastCigaretteAt]);

  const [toast, setToast] = useState<{ message: string; type: "success" | "warning" } | null>(null);

  // Modal state for achievement celebration / awareness
  type ModalType = "positive" | "awareness" | null;
  const [modalType, setModalType] = useState<ModalType>(null);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [modalUnlockedAt, setModalUnlockedAt] = useState<Date | undefined>(undefined);

  const openAchievementModal = useCallback((achievement: Achievement, unlockedAt?: Date) => {
    if (achievement.category === "awareness") {
      setModalType("awareness");
    } else {
      setModalType("positive");
    }
    setSelectedAchievement(achievement);
    setModalUnlockedAt(unlockedAt);
  }, []);

  const closeModal = useCallback(() => {
    setModalType(null);
    setSelectedAchievement(null);
    setModalUnlockedAt(undefined);
  }, []);

  // Process newly unlocked achievements - add to state and queue modals
  const processUnlockedAchievements = useCallback((unlockedIds: string[]) => {
    if (unlockedIds.length === 0) return;

    const now = new Date().toISOString();
    const newAchievements: UserAchievement[] = unlockedIds.map((id) => ({
      achievementId: id,
      unlockedAt: now,
    }));

    setUserAchievementsState((prev) => [...prev, ...newAchievements]);

    // Find achievement details and add to modal queue
    const newAchievementDetails = unlockedIds
      .map((id) => achievements.find((a) => a.id === id))
      .filter((a): a is Achievement => a !== undefined);

    setUnlockQueue((prev) => [...prev, ...newAchievementDetails]);
  }, [achievements]);

  // Process modal queue
  useEffect(() => {
    if (isProcessingQueue || unlockQueue.length === 0) return;

    setIsProcessingQueue(true);
    const nextAchievement = unlockQueue[0];
    openAchievementModal(nextAchievement, new Date());
  }, [unlockQueue, isProcessingQueue, openAchievementModal]);

  // Handle modal close - process next in queue
  const handleModalClose = useCallback(() => {
    closeModal();
    setUnlockQueue((prev) => prev.slice(1));
    setIsProcessingQueue(false);
  }, [closeModal]);

  const handleAction = useCallback(
    async (actionType: "breathing" | "meditation") => {
      try {
        const result = await registerPositiveAction(state.userId, actionType);
        console.log("ActionResult:", result);
        if (!result.error) {
          console.log("Updating gameState with nextActionAvailableAt:", result.gameState.nextActionAvailableAt);
          setState(result.gameState);
          saveCachedState(result.gameState);
          processUnlockedAchievements(result.unlockedAchievements);
        }
      } catch (err) {
        console.error(`Action failed: ${actionType}`, err);
      }
    },
    [state.userId, processUnlockedAchievements]
  );

  const handleCooldownExpired = useCallback(() => {
    setState((prev) => ({
      ...prev,
      nextActionAvailableAt: null,
    }));
  }, []);

  const handleRegisterCigarette = useCallback(async () => {
    try {
      const result = await registerCigarette(state.userId);
      setState(result.gameState);
      saveCachedState(result.gameState);
      processUnlockedAchievements(result.unlockedAchievements);
      setToast({
        message: result.penaltyApplied
          ? "⚠️ Penalización: perdiste 1 vida"
          : "Cigarro registrado",
        type: result.penaltyApplied ? "warning" : "success",
      });
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      console.error("Failed to register cigarette", err);
    }
  }, [state.userId, processUnlockedAchievements]);

  const handleDevResetLives = useCallback(async () => {
    try {
      const newGameState = await devResetLives(state.userId);
      setState(newGameState);
      saveCachedState(newGameState);
      setToast({ message: "🔄 Vidas regeneradas (dev)", type: "success" });
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      console.error("Failed to reset lives", err);
    }
  }, [state.userId]);

  const handleDevRemoveCooldown = useCallback(async () => {
    try {
      const newGameState = await devRemoveCooldown(state.userId);
      setState(newGameState);
      saveCachedState(newGameState);
      setToast({ message: "⚡ Cooldown eliminado (dev)", type: "success" });
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      console.error("Failed to remove cooldown", err);
    }
  }, [state.userId]);

  const isDev = process.env.NODE_ENV === "development";

  const isRelapsed = state.status === "relapse";

  return (
    <div className="min-h-screen bg-surface dark:bg-surface">
      <div className="mx-auto max-w-2xl px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-[32px] font-bold leading-tight text-text dark:text-text">
            {isRelapsed ? "💚 Recuperación" : "Tu Progreso Hoy"}
          </h1>
          <p className="text-[16px] text-text-muted">
            {isRelapsed
              ? "Estás en ventana de recuperación. ¡No te rindas!"
              : "Cada día es una oportunidad para ser más fuerte"}
          </p>
        </div>

        {/* Relapse banner */}
        {isRelapsed && (
          <div className="mb-4 rounded-xl border border-danger-soft bg-danger-soft p-3 dark:border-danger dark:bg-danger/30">
            <p className="text-sm font-medium text-danger dark:text-danger-soft">
              ⚠️ Has perdido todas tus vidas. Tienes 24 horas para recuperarte
              completando acciones positivas.
            </p>
          </div>
        )}

        {/* Dev Only: Reset Lives */}
        {isDev && (
          <div className="mb-4 flex gap-2">
            <button
              onClick={handleDevResetLives}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-accent-purple/30 bg-accent-purple/10 px-4 py-2 text-xs font-medium text-accent-purple transition-all active:scale-[0.98] hover:bg-accent-purple/15 dark:border-accent-purple/20 dark:bg-accent-purple/10"
              data-testid="dev-reset-lives-button"
            >
              🔄 Regenerar vidas
            </button>
            <button
              onClick={handleDevRemoveCooldown}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-warning/30 bg-warning/10 px-4 py-2 text-xs font-medium text-warning transition-all active:scale-[0.98] hover:bg-warning/15 dark:border-warning/20 dark:bg-warning/10"
              data-testid="dev-remove-cooldown-button"
            >
              ⚡ Quitar cooldown
            </button>
          </div>
        )}

        {/* Toast */}
        {toast && (
          <div
            className={`mb-4 rounded-xl px-4 py-3 text-sm font-medium text-center ${
              toast.type === "success"
                ? "border border-success-soft bg-success-soft text-success dark:border-success dark:bg-success/20 dark:text-success-soft"
                : "border border-danger-soft bg-danger-soft text-danger dark:border-danger dark:bg-danger/20 dark:text-danger-soft"
            }`}
          >
            {toast.message}
          </div>
        )}

        {/* Main content - single column on mobile */}
        <div className="space-y-3">
          <StreakDisplay streakDays={state.streakDays} />

          <LivesDisplay
            total={state.totalLives}
            remaining={state.remainingLives}
          />

          {state.totalPoints > 0 && (
            <p
              data-testid="extra-points"
              className="text-sm text-text-muted"
            >
              🎁 Vidas extra ganadas: {state.totalPoints}/3
            </p>
          )}
          
          <CigarettesToday
            count={state.cigarettesToday}
            threshold={CIGARETTE_THRESHOLD}
          />

          <div className="flex justify-center rounded-xl border border-border bg-gradient-to-b from-surface-card to-surface py-6 shadow-[0_1px_3px_rgba(0,0,0,0.1)] dark:border-border dark:from-surface-card dark:to-surface">
            <CigaretteButton
              currentCount={state.cigarettesToday}
              threshold={CIGARETTE_THRESHOLD}
              onRegister={handleRegisterCigarette}
            />
          </div>

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

          <AchievementGallery
            achievements={achievements}
            userAchievements={userAchievementsState}
            progress={progressState}
            onAchievementClick={openAchievementModal}
          />
        </div>
      </div>

      {/* Achievement celebration modal */}
      <AchievementModal
        achievement={selectedAchievement}
        isOpen={modalType === "positive"}
        onClose={handleModalClose}
        unlockedAt={modalUnlockedAt}
      />

      {/* Awareness modal (bad achievements B001-B007) */}
      <AwarenessModal
        achievement={selectedAchievement}
        isOpen={modalType === "awareness"}
        onClose={handleModalClose}
        message={
          selectedAchievement
            ? generateAwarenessMessage(state.cigarettesToday || 1)
            : ""
        }
      />
    </div>
  );
}
