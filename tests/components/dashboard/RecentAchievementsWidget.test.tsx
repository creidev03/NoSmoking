import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { RecentAchievementsWidget } from "@/components/dashboard/RecentAchievementsWidget";
import type { Achievement } from "@/lib/achievements/types";

const baseAchievement: Achievement = {
  id: "T001",
  name: "Primera Semana",
  icon: "🔥",
  category: "time",
  difficulty: "easy",
  isSecret: false,
  description: "7 días sin fumar",
  conditionType: "streak_days",
  conditionValue: 7,
};

const achievements: Achievement[] = [
  baseAchievement,
  {
    ...baseAchievement,
    id: "T002",
    name: "Dos Semanas",
    icon: "💪",
  },
  {
    ...baseAchievement,
    id: "T003",
    name: "Tres Semanas",
    icon: "🎯",
  },
  {
    ...baseAchievement,
    id: "T004",
    name: "Un Mes Limpio",
    icon: "⭐",
  },
];

const userAchievements = [
  { achievementId: "T001", unlockedAt: "2026-01-10T10:00:00Z" },
  { achievementId: "T002", unlockedAt: "2026-01-12T10:00:00Z" },
  { achievementId: "T003", unlockedAt: "2026-01-14T10:00:00Z" },
  { achievementId: "T004", unlockedAt: "2026-01-15T10:00:00Z" },
];

describe("RecentAchievementsWidget", () => {
  it("renders up to 3 achievements", () => {
    render(
      <RecentAchievementsWidget
        achievements={achievements}
        userAchievements={userAchievements}
      />
    );

    expect(screen.getByText("Tres Semanas")).toBeInTheDocument();
    expect(screen.getByText("Un Mes Limpio")).toBeInTheDocument();
    expect(screen.getByText("Dos Semanas")).toBeInTheDocument();
  });

  it("shows 'y X más' when more than maxItems", () => {
    render(
      <RecentAchievementsWidget
        achievements={achievements}
        userAchievements={userAchievements}
        maxItems={3}
      />
    );

    expect(screen.getByText(/y 1 más/)).toBeInTheDocument();
  });

  it("links to /dashboard/logros", () => {
    render(
      <RecentAchievementsWidget
        achievements={achievements}
        userAchievements={userAchievements}
      />
    );

    const links = screen.getAllByRole("link");
    const logrosLinks = links.filter(
      (link) => link.getAttribute("href") === "/dashboard/logros"
    );
    expect(logrosLinks.length).toBeGreaterThan(0);
  });

  it("shows empty state when no achievements", () => {
    render(
      <RecentAchievementsWidget
        achievements={achievements}
        userAchievements={[]}
      />
    );

    expect(
      screen.getByText(/Aún no has desbloqueado logros/)
    ).toBeInTheDocument();
  });
});
