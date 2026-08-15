import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AchievementCard } from "@/components/achievements/AchievementCard";
import type { Achievement } from "@/lib/achievements/types";

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

describe("AchievementCard", () => {
  describe("unlocked state", () => {
    it("renders achievement name when unlocked", () => {
      render(
        <AchievementCard
          achievement={baseAchievement}
          isUnlocked={true}
          progress={100}
        />
      );
      expect(screen.getByText("Primera Semana")).toBeInTheDocument();
    });

    it("renders achievement icon when unlocked", () => {
      render(
        <AchievementCard
          achievement={baseAchievement}
          isUnlocked={true}
          progress={100}
        />
      );
      expect(screen.getByText("🔥")).toBeInTheDocument();
    });

    it("renders achievement description when unlocked", () => {
      render(
        <AchievementCard
          achievement={baseAchievement}
          isUnlocked={true}
          progress={100}
        />
      );
      expect(
        screen.getByText("7 días sin fumar — ¡la primera semana completa!")
      ).toBeInTheDocument();
    });

    it("renders unlock date when provided", () => {
      const unlockedAt = new Date("2026-01-15T10:00:00Z");
      render(
        <AchievementCard
          achievement={baseAchievement}
          isUnlocked={true}
          progress={100}
          unlockedAt={unlockedAt}
        />
      );
      expect(screen.getByText(/15\/1\/2026/)).toBeInTheDocument();
    });

    it("does not show progress bar when unlocked", () => {
      render(
        <AchievementCard
          achievement={baseAchievement}
          isUnlocked={true}
          progress={100}
        />
      );
      expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    });
  });

  describe("locked state", () => {
    it("renders achievement name when locked and not secret", () => {
      render(
        <AchievementCard
          achievement={baseAchievement}
          isUnlocked={false}
          progress={50}
        />
      );
      expect(screen.getByText("Primera Semana")).toBeInTheDocument();
    });

    it("shows progress bar when progress > 0", () => {
      render(
        <AchievementCard
          achievement={baseAchievement}
          isUnlocked={false}
          progress={50}
        />
      );
      expect(screen.getByRole("progressbar")).toBeInTheDocument();
    });

    it("hides progress bar when progress is 0", () => {
      render(
        <AchievementCard
          achievement={baseAchievement}
          isUnlocked={false}
          progress={0}
        />
      );
      expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    });

    it("renders muted styling when locked", () => {
      const { container } = render(
        <AchievementCard
          achievement={baseAchievement}
          isUnlocked={false}
          progress={0}
        />
      );
      const card = container.firstChild as HTMLElement;
      expect(card.className).toContain("opacity-60");
    });
  });

  describe("secret state", () => {
    const secretAchievement: Achievement = {
      ...baseAchievement,
      id: "A005",
      name: "Acción Secreta",
      isSecret: true,
      description: "Completa una acción exactamente a medianoche",
    };

    it("shows ??? for name when secret and locked", () => {
      render(
        <AchievementCard
          achievement={secretAchievement}
          isUnlocked={false}
          progress={0}
        />
      );
      expect(screen.getByText("???")).toBeInTheDocument();
      expect(screen.queryByText("Acción Secreta")).not.toBeInTheDocument();
    });

    it("shows ??? for description when secret and locked", () => {
      render(
        <AchievementCard
          achievement={secretAchievement}
          isUnlocked={false}
          progress={0}
        />
      );
      expect(
        screen.queryByText("Completa una acción exactamente a medianoche")
      ).not.toBeInTheDocument();
    });

    it("reveals name and description when secret and unlocked", () => {
      render(
        <AchievementCard
          achievement={secretAchievement}
          isUnlocked={true}
          progress={100}
        />
      );
      expect(screen.getByText("Acción Secreta")).toBeInTheDocument();
      expect(
        screen.getByText("Completa una acción exactamente a medianoche")
      ).toBeInTheDocument();
    });

    it("shows lock icon for secret achievements", () => {
      render(
        <AchievementCard
          achievement={secretAchievement}
          isUnlocked={false}
          progress={0}
        />
      );
      expect(screen.getByText("🔒")).toBeInTheDocument();
    });
  });

  describe("difficulty badge", () => {
    it("renders difficulty level in Spanish", () => {
      render(
        <AchievementCard
          achievement={baseAchievement}
          isUnlocked={true}
          progress={100}
        />
      );
      expect(screen.getByText("Fácil")).toBeInTheDocument();
    });
  });
});
