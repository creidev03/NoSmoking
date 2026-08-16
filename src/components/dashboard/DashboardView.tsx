"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { type GameState } from "@/lib/game-state";
import { isCooldownActive, getPhase } from "@/lib/cooldown";
import { registerPositiveAction, registerCigarette, devResetLives, devRemoveCooldown } from "@/app/[locale]/dashboard/actions";
import { useTranslations } from "next-intl";
import { LivesDisplay } from "./LivesDisplay";
import { StreakDisplay } from "./StreakDisplay";
import { CigarettesToday } from "./CigarettesToday";
import { CooldownTimer } from "./CooldownTimer";
import { ActionButtons } from "./ActionButtons";
import { AchievementModal } from "@/components/achievements/AchievementModal";
import { AwarenessModal } from "@/components/achievements/AwarenessModal";
import { generateAwarenessMessage } from "@/lib/achievements/awareness-messages";
import type { Achievement } from "@/lib/achievements/types";
import { CigaretteButton } from "./CigaretteButton";

import { UpcomingEventsWidget } from "./UpcomingEventsWidget";
import { RelapseModal } from "./RelapseModal";


const CACHE_KEY = "dashboard-game-state";

interface DashboardViewProps {
  gameState: GameState;
  achievements?: Achievement[];
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
  achievements = [],
}: DashboardViewProps) {
  const t = useTranslations("dashboard");
  const tAwareness = useTranslations("awareness");
  const [state, setState] = useState(() => {
    // Server data is always fresh from DB — use it as source of truth
    // Cache is only a fallback for when server data isn't available yet (e.g. SSR)
    return gameState ?? loadCachedState();
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

  // Process newly unlocked achievements - queue modals
  const processUnlockedAchievements = useCallback((unlockedIds: string[]) => {
    if (unlockedIds.length === 0) return;

    // Find achievement details and add to modal queue
    const newAchievementDetails = unlockedIds
      .map((id) => achievements.find((a) => a.id === id))
      .filter((a): a is Achievement => a !== undefined);

    if (newAchievementDetails.length > 0) {
      // Show first achievement modal immediately
      openAchievementModal(newAchievementDetails[0], new Date());
    }
  }, [achievements, openAchievementModal]);

  // Handle modal close
  const handleModalClose = useCallback(() => {
    closeModal();
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
          ? t("penaltyApplied")
          : t("cigaretteRegistered"),
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
      setToast({ message: t("devResetLives"), type: "success" });
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
      setToast({ message: t("devRemoveCooldown"), type: "success" });
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      console.error("Failed to remove cooldown", err);
    }
  }, [state.userId]);

  const isDev = process.env.NODE_ENV === "development";

  const isRelapsed = state.status === "relapse";

  // Auto-show relapse modal when user enters relapse state
  const [showRelapseModal, setShowRelapseModal] = useState(false);

  // Track if we've shown the modal for this relapse session (persisted in localStorage)
  const RELAPSE_SHOWN_KEY = "relapse-modal-shown";
  const relapseSessionKey = state.relapseStartedAt || "";
  const [lastShownRelapse, setLastShownRelapse] = useState(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem(RELAPSE_SHOWN_KEY) || "";
  });

  useEffect(() => {
    if (isRelapsed && relapseSessionKey && relapseSessionKey !== lastShownRelapse) {
      setShowRelapseModal(true);
      setLastShownRelapse(relapseSessionKey);
      try {
        localStorage.setItem(RELAPSE_SHOWN_KEY, relapseSessionKey);
      } catch {
        // localStorage unavailable — silently skip
      }
    }
  }, [isRelapsed, relapseSessionKey, lastShownRelapse]);

  return (
    <div className="min-h-screen bg-surface dark:bg-surface">
      <div className="mx-auto max-w-2xl px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-[32px] font-bold leading-tight text-text dark:text-text">
            {isRelapsed ? t("recoveryTitle") : t("title")}
          </h1>
          <p className="text-[16px] text-text-muted">
            {isRelapsed
              ? t("recoverySubtitle")
              : t("subtitle")}
          </p>
        </div>

        {/* Relapse banner */}
        {isRelapsed && (
          <div className="mb-4 rounded-xl border border-warning/30 bg-warning/5 p-3 dark:border-warning/20 dark:bg-warning/5">
            <p className="text-sm font-medium text-warning dark:text-warning">
              {t("relapseWarning")}
            </p>
            <button
              onClick={() => setShowRelapseModal(true)}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-warning/30 bg-warning/10 px-4 py-2 text-xs font-medium text-warning transition-all active:scale-[0.98] hover:bg-warning/15 dark:border-warning/20 dark:bg-warning/10 dark:text-warning"
            >
              🔄 {t("recoveryButton")}
            </button>
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
              🔄 {t("devResetLives")}
            </button>
            <button
              onClick={handleDevRemoveCooldown}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-warning/30 bg-warning/10 px-4 py-2 text-xs font-medium text-warning transition-all active:scale-[0.98] hover:bg-warning/15 dark:border-warning/20 dark:bg-warning/10"
              data-testid="dev-remove-cooldown-button"
            >
              ⚡ {t("devRemoveCooldown")}
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


          {/* Streak - full width card */}
          <div className="rounded-xl border border-border bg-surface-card p-4 shadow-[0_1px_3px_rgba(0,0,0,0.1)]">
            <StreakDisplay streakDays={state.streakDays} />
          </div>

          {/* Lives - full width card */}
          <div className="rounded-xl border border-border bg-surface-card p-4 shadow-[0_1px_3px_rgba(0,0,0,0.1)]">
            <LivesDisplay
              total={state.totalLives}
              remaining={state.remainingLives}
            />
          </div>

          {/* Cigarette button */}
          <div className="flex justify-center rounded-xl border border-border bg-gradient-to-b from-surface-card to-surface py-6 shadow-[0_1px_3px_rgba(0,0,0,0.1)] dark:border-border dark:from-surface-card dark:to-surface">
            <CigaretteButton
              currentCount={state.cigarettesToday}
              threshold={CIGARETTE_THRESHOLD}
              onRegister={handleRegisterCigarette}
            />
          </div>

          {/* Stats grid - 2 columns */}
          <div className="grid grid-cols-2 gap-3">
            <CooldownTimer
              nextActionAt={state.nextActionAvailableAt}
              phase={phase}
              onExpired={handleCooldownExpired}
            />
            <CigarettesToday
              count={state.cigarettesToday}
              threshold={CIGARETTE_THRESHOLD}
            />
          </div>

          {state.totalPoints > 0 && (
            <p
              data-testid="extra-points"
              className="text-sm text-text-muted"
            >
              🎁 {t("extraLives", { count: state.totalPoints })}
            </p>
          )}

          {/* Action buttons (legacy) */}
          <ActionButtons
            onAction={handleAction}
            isCooldownActive={cooldownActive}
            gameState={state}
          />

          {/* Upcoming events */}
          <UpcomingEventsWidget gameState={state} />
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
            ? generateAwarenessMessage(state.cigarettesToday || 1, tAwareness)
            : ""
        }
      />

      {/* Relapse recovery modal */}
      <RelapseModal
        isOpen={showRelapseModal}
        onClose={() => setShowRelapseModal(false)}
        gameState={state}
        userId={state.userId}
        onGameStateUpdate={(newGameState) => {
          setState(newGameState);
          saveCachedState(newGameState);
        }}
      />
    </div>
  );
}
