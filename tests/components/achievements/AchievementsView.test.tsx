import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AchievementsView } from "@/components/achievements/AchievementsView";
import type { Achievement } from "@/lib/achievements/types";

// Mock AchievementModal to avoid portal issues
vi.mock("@/components/achievements/AchievementModal", () => ({
  AchievementModal: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div data-testid="achievement-modal" /> : null,
}));

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string, params?: Record<string, string | number>) => {
    const translations: Record<string, string> = {
      "title": "🏆 Tus Logros",
      "ofTotal": "{n} de {total} desbloqueados ({percent}%)",
      "categories.all": "Todos",
      "categories.time": "Tiempo",
      "categories.progress": "Progreso",
      "categories.actions": "Acciones",
      "categories.challenges": "Desafíos",
      "categories.collection": "Colecciones",
      "categories.awareness": "Consciencia",
      "emptyCategory": "No hay logros en esta categoría",
      "loadMore": "Cargar más ({visible} de {total})",
      "T001.name": "Primera Semana",
      "P001.name": "Primer Cigarrillo Evitado",
      "A001.name": "Primera Acción Positiva",
      "T008.name": "Un Año",
      "progress": "Progreso",
      "unlocked": "Desbloqueado: {date}",
      "difficulty.easy": "Fácil",
    };
    let value = translations[key] || key;
    if (params) {
      for (const [param, val] of Object.entries(params)) {
        value = value.replace(`{${param}}`, String(val));
      }
    }
    return value;
  },
  useFormatter: () => ({
    dateTime: (value: Date) => value.toLocaleDateString("es-ES"),
  }),
}));

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
    id: "P001",
    name: "Primer Cigarrillo Evitado",
    icon: "🎉",
    category: "progress",
    conditionType: "milestones",
    conditionValue: 1,
  },
  {
    ...baseAchievement,
    id: "A001",
    name: "Primera Acción Positiva",
    icon: "✨",
    category: "actions",
    conditionType: "total_actions",
    conditionValue: 1,
  },
  {
    ...baseAchievement,
    id: "T008",
    name: "Un Año",
    icon: "🏆",
    isSecret: true,
    description: "365 días sin fumar",
    conditionType: "streak_days",
    conditionValue: 365,
  },
];

const userAchievements = [
  { achievementId: "T001", unlockedAt: "2026-01-10T10:00:00Z" },
];

describe("AchievementsView", () => {
  it("renders achievement grid", () => {
    render(
      <AchievementsView
        achievements={achievements}
        userAchievements={userAchievements}
        userId="u-1"
      />
    );

    expect(screen.getByText("Primera Semana")).toBeInTheDocument();
    expect(screen.getByText("Primer Cigarrillo Evitado")).toBeInTheDocument();
  });

  it("shows unlocked count and percentage", () => {
    render(
      <AchievementsView
        achievements={achievements}
        userAchievements={userAchievements}
        userId="u-1"
      />
    );

    expect(screen.getByText(/1 de 4 desbloqueados/)).toBeInTheDocument();
    expect(screen.getByText(/25%/)).toBeInTheDocument();
  });

  it("filter tabs switch categories", () => {
    render(
      <AchievementsView
        achievements={achievements}
        userAchievements={userAchievements}
        userId="u-1"
      />
    );

    // Click on "Tiempo" tab
    fireEvent.click(screen.getByRole("tab", { name: "Tiempo" }));

    // Should show only time achievements
    expect(screen.getByText("Primera Semana")).toBeInTheDocument();
    expect(
      screen.queryByText("Primer Cigarrillo Evitado")
    ).not.toBeInTheDocument();
  });

  it("locked achievements show progress", () => {
    render(
      <AchievementsView
        achievements={achievements}
        userAchievements={[]}
        userId="u-1"
      />
    );

    // Locked achievements should have opacity
    const cards = screen.getAllByTestId(/achievement-card-/);
    expect(cards.length).toBe(4);
  });

  it("secret achievements show ???", () => {
    render(
      <AchievementsView
        achievements={achievements}
        userAchievements={[]}
        userId="u-1"
      />
    );

    expect(screen.getByText("???")).toBeInTheDocument();
  });

  it("opens modal on unlocked achievement click", () => {
    render(
      <AchievementsView
        achievements={achievements}
        userAchievements={userAchievements}
        userId="u-1"
      />
    );

    const unlockedCard = screen.getByTestId("achievement-card-T001");
    fireEvent.click(unlockedCard);

    expect(screen.getByTestId("achievement-modal")).toBeInTheDocument();
  });
});
