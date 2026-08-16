import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { RelapseModal } from "@/components/dashboard/RelapseModal";
import type { GameState } from "@/lib/game-state";

// Mock server actions
const mockRegisterPositiveAction = vi.fn();
vi.mock("@/app/[locale]/dashboard/actions", () => ({
  registerPositiveAction: (...args: any[]) => mockRegisterPositiveAction(...args),
}));

// Mock child components
vi.mock("@/components/dashboard/RelapseCountdown", () => ({
  RelapseCountdown: ({ startedAt }: any) => (
    <div data-testid="relapse-countdown">{startedAt}</div>
  ),
}));

vi.mock("@/components/dashboard/RelapseProgress", () => ({
  RelapseProgress: ({ currentLives, targetLives, totalLives }: any) => (
    <div data-testid="relapse-progress">
      {currentLives}/{totalLives}
    </div>
  ),
}));

vi.mock("@/components/dashboard/RelapseTips", () => ({
  RelapseTips: ({ isOpen, onClose }: any) =>
    isOpen ? (
      <div data-testid="relapse-tips">
        <button onClick={onClose}>Close Tips</button>
      </div>
    ) : null,
}));

// Mock sonner
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const baseGameState: GameState = {
  id: "gs-1",
  userId: "u-1",
  totalLives: 8,
  remainingLives: 0,
  cigarettesToday: 0,
  streakDays: 5,
  lastCigaretteAt: null,
  lastActionAt: null,
  nextActionAvailableAt: null,
  status: "relapse",
  relapseStartedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  totalPoints: 0,
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-15T10:00:00Z",
};

describe("RelapseModal", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-15T12:00:00Z"));
    mockRegisterPositiveAction.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders when isOpen is true", () => {
    render(
      <RelapseModal
        isOpen={true}
        onClose={vi.fn()}
        gameState={baseGameState}
        userId="u-1"
      />
    );
    expect(screen.getByText("⚠️ RECAÍDA DETECTADA")).toBeInTheDocument();
    expect(screen.getByText("No te rindas. Esto es normal.")).toBeInTheDocument();
  });

  it("does not render when isOpen is false", () => {
    const { container } = render(
      <RelapseModal
        isOpen={false}
        onClose={vi.fn()}
        gameState={baseGameState}
        userId="u-1"
      />
    );
    expect(container.querySelector('[class*="fixed"]')).toBeNull();
  });

  it("shows countdown and progress components", () => {
    render(
      <RelapseModal
        isOpen={true}
        onClose={vi.fn()}
        gameState={baseGameState}
        userId="u-1"
      />
    );
    expect(screen.getByTestId("relapse-countdown")).toBeInTheDocument();
    expect(screen.getByTestId("relapse-progress")).toBeInTheDocument();
  });

  it("shows action buttons", () => {
    render(
      <RelapseModal
        isOpen={true}
        onClose={vi.fn()}
        gameState={baseGameState}
        userId="u-1"
      />
    );
    expect(screen.getByTestId("action-breathing")).toBeInTheDocument();
    expect(screen.getByTestId("action-meditation")).toBeInTheDocument();
    expect(screen.getByTestId("action-music")).toBeInTheDocument();
  });

  it("calls registerPositiveAction when action button is clicked", async () => {
    mockRegisterPositiveAction.mockResolvedValue({
      gameState: { ...baseGameState, remainingLives: 0.5 },
      cooldownMinutes: 20,
      nextActionAvailableAt: new Date(Date.now() + 20 * 60 * 1000).toISOString(),
      unlockedAchievements: [],
    });

    render(
      <RelapseModal
        isOpen={true}
        onClose={vi.fn()}
        gameState={baseGameState}
        userId="u-1"
      />
    );

    await act(async () => {
      fireEvent.click(screen.getByTestId("action-breathing"));
    });

    expect(mockRegisterPositiveAction).toHaveBeenCalledWith("u-1", "breathing");
  });

  it("auto-closes when life is recovered", async () => {
    const onClose = vi.fn();
    mockRegisterPositiveAction.mockResolvedValue({
      gameState: { ...baseGameState, remainingLives: 0.5 },
      cooldownMinutes: 20,
      nextActionAvailableAt: new Date(Date.now() + 20 * 60 * 1000).toISOString(),
      unlockedAchievements: [],
    });

    render(
      <RelapseModal
        isOpen={true}
        onClose={onClose}
        gameState={baseGameState}
        userId="u-1"
      />
    );

    await act(async () => {
      fireEvent.click(screen.getByTestId("action-breathing"));
    });

    expect(onClose).toHaveBeenCalled();
  });

  it("calls onClose when understood button is clicked", () => {
    const onClose = vi.fn();
    render(
      <RelapseModal
        isOpen={true}
        onClose={onClose}
        gameState={baseGameState}
        userId="u-1"
      />
    );

    fireEvent.click(screen.getByTestId("understood-button"));
    expect(onClose).toHaveBeenCalled();
  });

  it("opens tips modal when tips button is clicked", () => {
    render(
      <RelapseModal
        isOpen={true}
        onClose={vi.fn()}
        gameState={baseGameState}
        userId="u-1"
      />
    );

    fireEvent.click(screen.getByTestId("tips-button"));
    expect(screen.getByTestId("relapse-tips")).toBeInTheDocument();
  });
});
