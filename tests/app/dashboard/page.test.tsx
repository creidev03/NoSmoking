import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

// Mock the db module
vi.mock("@/lib/db", () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          get: vi.fn(() => Promise.resolve(null)),
        })),
      })),
    })),
  },
}));

// Mock DashboardView
vi.mock("@/components/dashboard/DashboardView", () => ({
  DashboardView: ({ gameState }: any) => (
    <div data-testid="dashboard-view">
      <span data-testid="remaining-lives">{gameState.remainingLives}</span>
      <span data-testid="streak-days">{gameState.streakDays}</span>
      <span data-testid="cigarettes-today">{gameState.cigarettesToday}</span>
    </div>
  ),
}));

// Mock redirect
vi.mock("next/navigation", () => ({
  redirect: vi.fn(() => {
    throw new Error("NEXT_REDIRECT");
  }),
}));

import DashboardPage from "@/app/dashboard/page";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

const mockDb = vi.mocked(db);
const mockRedirect = vi.mocked(redirect);

function mockSelectWithGameState(gameState: any) {
  mockDb.select.mockReturnValue({
    from: vi.fn(() => ({
      where: vi.fn(() => ({
        get: vi.fn(() => Promise.resolve(gameState)),
      })),
    })),
  } as any);
}

describe("DashboardPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-15T10:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("redirects to /onboarding when no game_state found", async () => {
    mockDb.select.mockReturnValue({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          get: vi.fn(() => Promise.resolve(null)),
        })),
      })),
    } as any);

    await expect(DashboardPage()).rejects.toThrow("NEXT_REDIRECT");
    expect(mockRedirect).toHaveBeenCalledWith("/onboarding");
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

    const element = await DashboardPage();
    render(element);

    expect(screen.getByTestId("dashboard-view")).toBeInTheDocument();
    expect(screen.getByTestId("remaining-lives")).toHaveTextContent("3");
    expect(screen.getByTestId("streak-days")).toHaveTextContent("7");
    expect(screen.getByTestId("cigarettes-today")).toHaveTextContent("2");
  });

  it("passes complete game state to DashboardView", async () => {
    const gameState = {
      id: "gs-2",
      userId: "user-2",
      totalLives: 6,
      remainingLives: 5,
      cigarettesToday: 0,
      streakDays: 30,
      lastCigaretteAt: "2026-01-14T20:00:00.000Z",
      lastActionAt: "2026-01-15T09:00:00.000Z",
      nextActionAvailableAt: "2026-01-15T09:20:00.000Z",
      status: "active",
      relapseStartedAt: null,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-15T10:00:00.000Z",
    };

    mockSelectWithGameState(gameState);

    const element = await DashboardPage();
    render(element);

    expect(screen.getByTestId("remaining-lives")).toHaveTextContent("5");
    expect(screen.getByTestId("streak-days")).toHaveTextContent("30");
  });
});
