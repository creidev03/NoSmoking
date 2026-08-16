import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AchievementModal } from "@/components/achievements/AchievementModal";
import type { Achievement } from "@/lib/achievements/types";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string, params?: Record<string, string | number>) => {
    const translations: Record<string, string> = {
      "T001.name": "Primera Semana",
      "T001.description": "7 días sin fumar — ¡la primera semana completa!",
      "difficulty.easy": "Fácil",
      "unlocked": "Desbloqueado: {date}",
      "share": "COMPARTIR",
      "understood": "ENTENDIDO",
      "shareMessage": "🏆 ¡Desbloqueé \"{name}\" en No Smoking!\n\n{description}",
      "copied": "Copiado al portapapeles",
      "copiedDescription": "Pega el mensaje para compartir tu logro",
      "close": "Cerrar",
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
  description: "7 días sin fumar — ¡la primera semana completa!",
  conditionType: "streak_days",
  conditionValue: 7,
};

describe("AchievementModal", () => {
  it("renders nothing when isOpen is false", () => {
    render(
      <AchievementModal
        achievement={baseAchievement}
        isOpen={false}
        onClose={vi.fn()}
      />
    );
    expect(screen.queryByText("Primera Semana")).not.toBeInTheDocument();
  });

  it("renders nothing when achievement is null", () => {
    render(
      <AchievementModal
        achievement={null}
        isOpen={true}
        onClose={vi.fn()}
      />
    );
    expect(screen.queryByText("Primera Semana")).not.toBeInTheDocument();
  });

  it("renders achievement name when isOpen is true", () => {
    render(
      <AchievementModal
        achievement={baseAchievement}
        isOpen={true}
        onClose={vi.fn()}
      />
    );
    expect(screen.getByText("Primera Semana")).toBeInTheDocument();
  });

  it("renders achievement icon", () => {
    render(
      <AchievementModal
        achievement={baseAchievement}
        isOpen={true}
        onClose={vi.fn()}
      />
    );
    expect(screen.getByText("🔥")).toBeInTheDocument();
  });

  it("renders achievement description", () => {
    render(
      <AchievementModal
        achievement={baseAchievement}
        isOpen={true}
        onClose={vi.fn()}
      />
    );
    expect(
      screen.getByText("7 días sin fumar — ¡la primera semana completa!")
    ).toBeInTheDocument();
  });

  it("renders difficulty stars in Spanish", () => {
    render(
      <AchievementModal
        achievement={baseAchievement}
        isOpen={true}
        onClose={vi.fn()}
      />
    );
    expect(screen.getByText("Fácil")).toBeInTheDocument();
  });

  it("renders unlocked date when provided", () => {
    const unlockedAt = new Date("2026-01-15T10:00:00Z");
    render(
      <AchievementModal
        achievement={baseAchievement}
        isOpen={true}
        onClose={vi.fn()}
        unlockedAt={unlockedAt}
      />
    );
    expect(screen.getByText(/15\/1\/2026/)).toBeInTheDocument();
  });

  it("hides COMPARTIR button when achievement is locked", () => {
    render(
      <AchievementModal
        achievement={baseAchievement}
        isOpen={true}
        onClose={vi.fn()}
      />
    );
    expect(screen.queryByText("COMPARTIR")).not.toBeInTheDocument();
  });

  it("shows COMPARTIR button when achievement is unlocked", () => {
    render(
      <AchievementModal
        achievement={baseAchievement}
        isOpen={true}
        onClose={vi.fn()}
        unlockedAt={new Date("2026-01-15T10:00:00Z")}
      />
    );
    expect(screen.getByText("COMPARTIR")).toBeInTheDocument();
  });

  it("renders ENTENDIDO button", () => {
    render(
      <AchievementModal
        achievement={baseAchievement}
        isOpen={true}
        onClose={vi.fn()}
      />
    );
    expect(screen.getByText("ENTENDIDO")).toBeInTheDocument();
  });

  it("calls onClose when ENTENDIDO button is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <AchievementModal
        achievement={baseAchievement}
        isOpen={true}
        onClose={onClose}
      />
    );
    await user.click(screen.getByText("ENTENDIDO"));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("calls onClose when backdrop is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <AchievementModal
        achievement={baseAchievement}
        isOpen={true}
        onClose={onClose}
      />
    );
    // Click the backdrop (the outermost overlay div)
    const backdrop = screen.getByTestId("achievement-modal-backdrop");
    await user.click(backdrop);
    expect(onClose).toHaveBeenCalledOnce();
  });
});
