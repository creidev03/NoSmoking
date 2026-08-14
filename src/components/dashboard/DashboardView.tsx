"use client";

import { useState, useCallback, useMemo } from "react";
import { type GameState } from "@/lib/game-state";
import { isCooldownActive, getPhase } from "@/lib/cooldown";
import { LivesDisplay } from "./LivesDisplay";
import { StreakDisplay } from "./StreakDisplay";
import { CigarettesToday } from "./CigarettesToday";
import { CooldownTimer } from "./CooldownTimer";
import { ActionButtons } from "./ActionButtons";
import { BadgesList } from "./BadgesList";

interface Badge {
  key: string;
  unlockedAt: string;
}

interface DashboardViewProps {
  gameState: GameState;
  badges?: Badge[];
}

const CIGARETTE_THRESHOLD = 5;

export function DashboardView({
  gameState,
  badges = [],
}: DashboardViewProps) {
  const [state, setState] = useState(gameState);

  const cooldownActive = isCooldownActive(state.nextActionAvailableAt);

  const phase = useMemo(() => {
    if (!state.lastCigaretteAt) return 4;
    return getPhase(new Date(state.lastCigaretteAt), new Date()).phase;
  }, [state.lastCigaretteAt]);

  const handleAction = useCallback(
    async (actionType: "breathing" | "meditation" | "music") => {
      // Action will be handled by server action in parent
      console.log(`Action triggered: ${actionType}`);
    },
    []
  );

  const handleCooldownExpired = useCallback(() => {
    setState((prev) => ({
      ...prev,
      nextActionAvailableAt: null,
    }));
  }, []);

  return (
    <div data-testid="dashboard-view">
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
  );
}
