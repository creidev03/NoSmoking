import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next-intl/server", () => ({
  setRequestLocale: vi.fn(),
}));

// Mock Clerk auth (server-only module)
const mockAuth = vi.fn();
vi.mock("@clerk/nextjs/server", () => ({
  auth: (...args: any[]) => mockAuth(...args),
}));

// Mock the db module
vi.mock("@/lib/db", () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          get: vi.fn(() => Promise.resolve(null)),
          all: vi.fn(() => Promise.resolve([])),
        })),
      })),
    })),
  },
}));

// Mock DashboardView — capture props for assertions
let dashboardViewProps: any = null;
vi.mock("@/components/dashboard/DashboardView", () => ({
  DashboardView: (props: any) => {
    dashboardViewProps = props;
    return (
      <div data-testid="dashboard-view">
        <span data-testid="remaining-lives">{props.gameState.remainingLives}</span>
        <span data-testid="streak-days">{props.gameState.streakDays}</span>
        <span data-testid="cigarettes-today">{props.gameState.cigarettesToday}</span>
        <span data-testid="user-achievements-count">{props.userAchievements?.length ?? 0}</span>
        <span data-testid="progress-count">{props.progress?.length ?? 0}</span>
      </div>
    );
  },
}));

// Mock redirect
vi.mock("next/navigation", () => ({
  redirect: vi.fn(() => {
    throw new Error("NEXT_REDIRECT");
  }),
}));

// Mock processMidnightReset
const { mockProcessMidnightReset } = vi.hoisted(() => ({
  mockProcessMidnightReset: vi.fn().mockResolvedValue({
    gameState: {
      id: "gs-1",
      userId: "user-1",
      totalLives: 4,
      remainingLives: 3,
      cigarettesToday: 2,
      streakDays: 7,
      lastCigaretteAt: null,
      lastActionAt: null,
      nextActionAvailableAt: null,
      status: "active",
      relapseStartedAt: null,
      totalPoints: 0,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-15T10:00:00.000Z",
    },
    newBadges: [],
    achievements: {
      userAchievements: [],
      progress: [],
    },
  }),
}));
vi.mock("@/app/[locale]/dashboard/actions", () => ({
  processMidnightReset: mockProcessMidnightReset,
}));

import DashboardPage from "@/app/[locale]/dashboard/page";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

const mockDb = vi.mocked(db);
const mockRedirect = vi.mocked(redirect);

// Default: authenticated user
mockAuth.mockResolvedValue({ userId: "user-1" });

function mockSelectWithGameState(gameState: any) {
  mockDb.select.mockReturnValue({
    from: vi.fn(() => ({
      where: vi.fn(() => ({
        get: vi.fn(() => Promise.resolve(gameState)),
        all: vi.fn(() => Promise.resolve([])),
      })),
    })),
  } as any);
}

describe("DashboardPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-15T10:00:00.000Z"));
    dashboardViewProps = null;

    // Default mock return
    mockProcessMidnightReset.mockResolvedValue({
      gameState: {
        id: "gs-1",
        userId: "user-1",
        totalLives: 4,
        remainingLives: 3,
        cigarettesToday: 2,
        streakDays: 7,
        lastCigaretteAt: null,
        lastActionAt: null,
        nextActionAvailableAt: null,
        status: "active",
        relapseStartedAt: null,
        totalPoints: 0,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-15T10:00:00.000Z",
      },
      newBadges: [],
      achievements: {
        userAchievements: [],
        progress: [],
      },
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("redirects to /sign-in when not authenticated", async () => {
    mockAuth.mockResolvedValueOnce({ userId: null });

    await expect(DashboardPage({ params: Promise.resolve({ locale: "es" }) })).rejects.toThrow("NEXT_REDIRECT");
    expect(mockRedirect).toHaveBeenCalledWith("/es/sign-in");
  });

  it("redirects to /onboarding when no game_state found", async () => {
    mockAuth.mockResolvedValue({ userId: "user-1" });
    mockDb.select.mockReturnValue({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          get: vi.fn(() => Promise.resolve(null)),
          all: vi.fn(() => Promise.resolve([])),
        })),
      })),
    } as any);

    await expect(DashboardPage({ params: Promise.resolve({ locale: "es" }) })).rejects.toThrow("NEXT_REDIRECT");
    expect(mockRedirect).toHaveBeenCalledWith("/es/onboarding");
  });

  it("renders DashboardView with game state data", async () => {
    const gameState = {
      id: "gs-1",
      userId: "user-1",
      totalLives: 4,
      remainingLives: 3,
      cigarettesToday: 2,
      streakDays: 7,
      lastCigaretteAt: null,
      lastActionAt: null,
      nextActionAvailableAt: null,
      status: "active",
      relapseStartedAt: null,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-15T10:00:00.000Z",
    };

    mockSelectWithGameState(gameState);

    const element = await DashboardPage({ params: Promise.resolve({ locale: "es" }) });
    render(element);

    expect(screen.getByTestId("dashboard-view")).toBeInTheDocument();
    expect(screen.getByTestId("remaining-lives")).toHaveTextContent("3");
    expect(screen.getByTestId("streak-days")).toHaveTextContent("7");
    expect(screen.getByTestId("cigarettes-today")).toHaveTextContent("2");
  });

  it("calls processMidnightReset with the user ID", async () => {
    const gameState = {
      id: "gs-1",
      userId: "user-1",
      totalLives: 4,
      remainingLives: 3,
      cigarettesToday: 2,
      streakDays: 7,
      lastCigaretteAt: null,
      lastActionAt: null,
      nextActionAvailableAt: null,
      status: "active",
      relapseStartedAt: null,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-15T10:00:00.000Z",
    };

    mockSelectWithGameState(gameState);

    await DashboardPage({ params: Promise.resolve({ locale: "es" }) });

    expect(mockProcessMidnightReset).toHaveBeenCalled();
  });

  it("passes userAchievements and progress from processMidnightReset to DashboardView", async () => {
    const gameState = {
      id: "gs-1",
      userId: "user-1",
      totalLives: 4,
      remainingLives: 3,
      cigarettesToday: 2,
      streakDays: 7,
      lastCigaretteAt: null,
      lastActionAt: null,
      nextActionAvailableAt: null,
      status: "active",
      relapseStartedAt: null,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-15T10:00:00.000Z",
    };

    mockSelectWithGameState(gameState);

    mockProcessMidnightReset.mockResolvedValueOnce({
      gameState,
      newBadges: [],
      achievements: {
        userAchievements: [
          { achievementId: "T001", unlockedAt: "2026-01-10T00:00:00.000Z" },
          { achievementId: "P001", unlockedAt: "2026-01-12T00:00:00.000Z" },
        ],
        progress: [
          { achievementId: "T002", currentValue: 7 },
        ],
      },
    });

    dashboardViewProps = null;
    const element = await DashboardPage({ params: Promise.resolve({ locale: "es" }) });
    render(element);

    expect(dashboardViewProps).not.toBeNull();
    expect(dashboardViewProps.achievements).toBeDefined();
  });

  it("passes empty achievement arrays when user has none", async () => {
    const gameState = {
      id: "gs-1",
      userId: "user-1",
      totalLives: 4,
      remainingLives: 3,
      cigarettesToday: 2,
      streakDays: 7,
      lastCigaretteAt: null,
      lastActionAt: null,
      nextActionAvailableAt: null,
      status: "active",
      relapseStartedAt: null,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-15T10:00:00.000Z",
    };

    mockSelectWithGameState(gameState);

    mockProcessMidnightReset.mockResolvedValueOnce({
      gameState,
      newBadges: [],
      achievements: {
        userAchievements: [],
        progress: [],
      },
    });

    dashboardViewProps = null;
    const element = await DashboardPage({ params: Promise.resolve({ locale: "es" }) });
    render(element);

    expect(dashboardViewProps).not.toBeNull();
    expect(dashboardViewProps.achievements).toBeDefined();
  });
});
