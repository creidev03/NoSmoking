import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act, waitFor } from "@testing-library/react";
import { DashboardView } from "@/components/dashboard/DashboardView";
import type { GameState } from "@/lib/game-state";

// Mock server actions
const mockRegisterPositiveAction = vi.fn();
vi.mock("@/app/dashboard/actions", () => ({
  registerPositiveAction: (...args: any[]) => mockRegisterPositiveAction(...args),
}));

// Mock child components to focus on phase computation
vi.mock("@/components/dashboard/LivesDisplay", () => ({
  LivesDisplay: ({ total, remaining }: any) => (
    <div data-testid="lives-display">{remaining}/{total}</div>
  ),
}));

vi.mock("@/components/dashboard/StreakDisplay", () => ({
  StreakDisplay: ({ streakDays }: any) => (
    <div data-testid="streak-display">{streakDays}</div>
  ),
}));

vi.mock("@/components/dashboard/CigarettesToday", () => ({
  CigarettesToday: ({ count }: any) => (
    <div data-testid="cigarettes-today">{count}</div>
  ),
}));

vi.mock("@/components/dashboard/CooldownTimer", () => ({
  CooldownTimer: ({ nextActionAt, phase }: any) => (
    <div data-testid="cooldown-timer" data-phase={phase}>
      phase:{phase}
    </div>
  ),
}));

vi.mock("@/components/dashboard/ActionButtons", () => ({
  ActionButtons: ({ onAction }: any) => (
    <div data-testid="action-buttons">
      <button data-testid="btn-breathing" onClick={() => onAction("breathing")}>
        Breathing
      </button>
    </div>
  ),
}));

vi.mock("@/components/achievements/AchievementGallery", () => ({
  AchievementGallery: () => <div data-testid="achievement-gallery" />,
}));

const baseGameState: GameState = {
  id: "gs-1",
  userId: "u-1",
  totalLives: 8,
  remainingLives: 6,
  cigarettesToday: 2,
  streakDays: 5,
  lastCigaretteAt: null,
  lastActionAt: null,
  nextActionAvailableAt: null,
  status: "active",
  relapseStartedAt: null,
  totalPoints: 0,
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-15T10:00:00Z",
};

describe("DashboardView", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-15T12:00:00Z"));
    mockRegisterPositiveAction.mockReset();
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("computes phase 1 when lastCigaretteAt is within 2 hours", () => {
    const gameState = {
      ...baseGameState,
      lastCigaretteAt: "2026-01-15T11:00:00Z", // 1 hour ago
      nextActionAvailableAt: "2026-01-15T11:20:00Z",
    };

    render(<DashboardView gameState={gameState} />);
    const timer = screen.getByTestId("cooldown-timer");
    expect(timer).toHaveAttribute("data-phase", "1");
  });

  it("computes phase 2 when lastCigaretteAt is 2-8 hours ago", () => {
    const gameState = {
      ...baseGameState,
      lastCigaretteAt: "2026-01-15T08:00:00Z", // 4 hours ago
      nextActionAvailableAt: "2026-01-15T08:15:00Z",
    };

    render(<DashboardView gameState={gameState} />);
    const timer = screen.getByTestId("cooldown-timer");
    expect(timer).toHaveAttribute("data-phase", "2");
  });

  it("computes phase 3 when lastCigaretteAt is 8-24 hours ago", () => {
    const gameState = {
      ...baseGameState,
      lastCigaretteAt: "2026-01-15T02:00:00Z", // 10 hours ago
      nextActionAvailableAt: "2026-01-15T02:45:00Z",
    };

    render(<DashboardView gameState={gameState} />);
    const timer = screen.getByTestId("cooldown-timer");
    expect(timer).toHaveAttribute("data-phase", "3");
  });

  it("computes phase 4 when lastCigaretteAt is more than 24 hours ago", () => {
    const gameState = {
      ...baseGameState,
      lastCigaretteAt: "2026-01-14T10:00:00Z", // 26 hours ago
      nextActionAvailableAt: null,
    };

    render(<DashboardView gameState={gameState} />);
    const timer = screen.getByTestId("cooldown-timer");
    expect(timer).toHaveAttribute("data-phase", "4");
  });

  it("defaults to phase 4 when lastCigaretteAt is null", () => {
    const gameState = {
      ...baseGameState,
      lastCigaretteAt: null,
      nextActionAvailableAt: null,
    };

    render(<DashboardView gameState={gameState} />);
    const timer = screen.getByTestId("cooldown-timer");
    expect(timer).toHaveAttribute("data-phase", "4");
  });

  it("calls registerPositiveAction when handleAction is invoked", async () => {
    mockRegisterPositiveAction.mockResolvedValue({
      gameState: { ...baseGameState, remainingLives: 7 },
      cooldownMinutes: 20,
      nextActionAvailableAt: "2026-01-15T12:20:00Z",
    });

    render(<DashboardView gameState={baseGameState} />);

    const btn = screen.getByTestId("btn-breathing");

    await act(async () => {
      btn.click();
      await vi.advanceTimersByTimeAsync(100);
    });

    expect(mockRegisterPositiveAction).toHaveBeenCalledWith(
      "u-1",
      "breathing"
    );
  });

  it("passes userId and actionType to registerPositiveAction", async () => {
    mockRegisterPositiveAction.mockResolvedValue({
      gameState: baseGameState,
      cooldownMinutes: 20,
      nextActionAvailableAt: "2026-01-15T12:20:00Z",
    });

    render(<DashboardView gameState={baseGameState} />);

    const btn = screen.getByTestId("btn-breathing");

    await act(async () => {
      btn.click();
    });

    expect(mockRegisterPositiveAction).toHaveBeenCalledWith(
      "u-1",
      "breathing"
    );
  });

  describe("offline cache", () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it("saves game state to localStorage after mount", () => {
      render(<DashboardView gameState={baseGameState} />);

      const cached = localStorage.getItem("dashboard-game-state");
      expect(cached).not.toBeNull();
      const parsed = JSON.parse(cached!);
      expect(parsed.gameState.id).toBe("gs-1");
      expect(parsed.gameState.remainingLives).toBe(6);
      expect(parsed.timestamp).toBeDefined();
    });

    it("loads cached game state on mount", () => {
      const cachedData = {
        gameState: { ...baseGameState, remainingLives: 3 },
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem("dashboard-game-state", JSON.stringify(cachedData));

      render(<DashboardView gameState={baseGameState} />);

      // Should use cached data initially
      expect(screen.getByTestId("lives-display")).toHaveTextContent("3/8");
    });

    it("updates cache after successful action", async () => {
      const updatedState = {
        ...baseGameState,
        remainingLives: 7,
      };
      mockRegisterPositiveAction.mockResolvedValue({
        gameState: updatedState,
        cooldownMinutes: 20,
        nextActionAvailableAt: "2026-01-15T12:20:00Z",
      });

      render(<DashboardView gameState={baseGameState} />);

      const btn = screen.getByTestId("btn-breathing");
      await act(async () => {
        btn.click();
      });

      const cached = localStorage.getItem("dashboard-game-state");
      expect(cached).not.toBeNull();
      const parsed = JSON.parse(cached!);
      expect(parsed.gameState.remainingLives).toBe(7);
    });
  });
});
