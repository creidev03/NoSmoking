import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AchievementGallery } from "@/components/achievements/AchievementGallery";
import type { Achievement } from "@/lib/achievements/types";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string, params?: Record<string, string | number>) => {
    const translations: Record<string, string> = {
      "title": "🏆 Logros",
      "count": "{n} de {total} logros desbloqueados",
      "categories.all": "Todos",
      "categories.time": "Tiempo",
      "categories.progress": "Progreso",
      "categories.actions": "Acciones",
      "categories.challenges": "Desafíos",
      "categories.collection": "Colecciones",
      "categories.awareness": "Consciencia",
      "emptyCategory": "No hay logros en esta categoría",
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

const achievements: Achievement[] = [
  {
    id: "T001",
    name: "Primera Semana",
    icon: "🔥",
    category: "time",
    difficulty: "easy",
    isSecret: false,
    description: "7 días sin fumar",
    conditionType: "streak_days",
    conditionValue: 7,
  },
  {
    id: "P001",
    name: "Primer Cigarrillo Evitado",
    icon: "🚫",
    category: "progress",
    difficulty: "easy",
    isSecret: false,
    description: "Evitaste tu primer cigarrillo",
    conditionType: "milestones",
    conditionValue: 1,
  },
  {
    id: "A001",
    name: "Primera Acción Positiva",
    icon: "🎯",
    category: "actions",
    difficulty: "easy",
    isSecret: false,
    description: "Primera acción positiva",
    conditionType: "total_actions",
    conditionValue: 1,
  },
  {
    id: "D001",
    name: "Desafío del Día",
    icon: "⚔️",
    category: "challenges",
    difficulty: "easy",
    isSecret: false,
    description: "Primer desafío diario",
    conditionType: "milestones",
    conditionValue: 1,
  },
];

const userAchievements = [
  { achievementId: "T001", unlockedAt: "2026-01-15T10:00:00Z" },
];

const progress = [
  { achievementId: "P001", currentValue: 50 },
  { achievementId: "A001", currentValue: 0 },
];

describe("AchievementGallery", () => {
  it("renders all achievements in the grid", () => {
    render(
      <AchievementGallery
        achievements={achievements}
        userAchievements={userAchievements}
        progress={progress}
      />
    );

    expect(screen.getByTestId("achievement-card-T001")).toBeInTheDocument();
    expect(screen.getByTestId("achievement-card-P001")).toBeInTheDocument();
    expect(screen.getByTestId("achievement-card-A001")).toBeInTheDocument();
    expect(screen.getByTestId("achievement-card-D001")).toBeInTheDocument();
  });

  it("displays unlocked count", () => {
    render(
      <AchievementGallery
        achievements={achievements}
        userAchievements={userAchievements}
        progress={progress}
      />
    );

    expect(screen.getByText(/1 de 4 logros desbloqueados/)).toBeInTheDocument();
  });

  describe("category filters", () => {
    it("shows all filter tabs", () => {
      render(
        <AchievementGallery
          achievements={achievements}
          userAchievements={userAchievements}
          progress={progress}
        />
      );

      expect(screen.getByRole("tab", { name: /todos/i })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: /tiempo/i })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: /progreso/i })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: /acciones/i })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: /desafíos/i })).toBeInTheDocument();
    });

    it("filters achievements by category when tab is clicked", () => {
      render(
        <AchievementGallery
          achievements={achievements}
          userAchievements={userAchievements}
          progress={progress}
        />
      );

      // Click on "Tiempo" tab
      fireEvent.click(screen.getByRole("tab", { name: /tiempo/i }));

      // Only time achievements should be visible
      expect(screen.getByTestId("achievement-card-T001")).toBeInTheDocument();
      expect(screen.queryByTestId("achievement-card-P001")).not.toBeInTheDocument();
      expect(screen.queryByTestId("achievement-card-A001")).not.toBeInTheDocument();
      expect(screen.queryByTestId("achievement-card-D001")).not.toBeInTheDocument();
    });

    it("shows all achievements when 'Todos' tab is clicked", () => {
      render(
        <AchievementGallery
          achievements={achievements}
          userAchievements={userAchievements}
          progress={progress}
        />
      );

      // First filter to a specific category
      fireEvent.click(screen.getByRole("tab", { name: /tiempo/i }));
      expect(screen.queryByTestId("achievement-card-P001")).not.toBeInTheDocument();

      // Click "Todos" to show all
      fireEvent.click(screen.getByRole("tab", { name: /todos/i }));
      expect(screen.getByTestId("achievement-card-T001")).toBeInTheDocument();
      expect(screen.getByTestId("achievement-card-P001")).toBeInTheDocument();
      expect(screen.getByTestId("achievement-card-A001")).toBeInTheDocument();
      expect(screen.getByTestId("achievement-card-D001")).toBeInTheDocument();
    });
  });

  it("shows empty state when no achievements match filter", () => {
    // Only time achievements, but filter to 'awareness'
    const timeOnly: Achievement[] = [
      {
        id: "T001",
        name: "Primera Semana",
        icon: "🔥",
        category: "time",
        difficulty: "easy",
        isSecret: false,
        description: "7 días sin fumar",
        conditionType: "streak_days",
        conditionValue: 7,
      },
    ];

    render(
      <AchievementGallery
        achievements={timeOnly}
        userAchievements={[]}
        progress={[]}
      />
    );

    // Click on awareness tab
    fireEvent.click(screen.getByRole("tab", { name: /consciencia/i }));

    expect(screen.getByText(/No hay logros en esta categoría/)).toBeInTheDocument();
  });

  it("marks unlocked achievements correctly", () => {
    render(
      <AchievementGallery
        achievements={achievements}
        userAchievements={userAchievements}
        progress={progress}
      />
    );

    const unlockedCard = screen.getByTestId("achievement-card-T001");
    expect(unlockedCard).toHaveAttribute("data-unlocked", "true");

    const lockedCard = screen.getByTestId("achievement-card-P001");
    expect(lockedCard).toHaveAttribute("data-unlocked", "false");
  });
});
