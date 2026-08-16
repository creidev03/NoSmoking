"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Achievement } from "@/lib/achievements/types";
import { AchievementCard } from "./AchievementCard";

interface UserAchievement {
  achievementId: string;
  unlockedAt: string;
}

interface AchievementProgress {
  achievementId: string;
  currentValue: number;
}

interface AchievementGalleryProps {
  achievements: Achievement[];
  userAchievements: UserAchievement[];
  progress?: AchievementProgress[];
  onAchievementClick?: (achievement: Achievement, unlockedAt?: Date) => void;
}

type CategoryFilter = "all" | "time" | "progress" | "actions" | "challenges" | "collection" | "awareness";

const categoryTabs: { id: CategoryFilter; label: string }[] = [
  { id: "all", label: "Todos" },
  { id: "time", label: "Tiempo" },
  { id: "progress", label: "Progreso" },
  { id: "actions", label: "Acciones" },
  { id: "challenges", label: "Desafíos" },
  { id: "collection", label: "Colecciones" },
  { id: "awareness", label: "Consciencia" },
];

export function AchievementGallery({
  achievements,
  userAchievements,
  progress,
  onAchievementClick,
}: AchievementGalleryProps) {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("all");

  // Create lookup maps for performance
  const unlockedMap = new Map(
    userAchievements.map((ua) => [ua.achievementId, ua.unlockedAt])
  );

  const progressMap = new Map(
    (progress ?? []).map((p) => [p.achievementId, p.currentValue])
  );

  // Filter achievements by category
  const filteredAchievements =
    activeCategory === "all"
      ? achievements
      : achievements.filter((a) => a.category === activeCategory);

  // Count unlocked
  const totalUnlocked = userAchievements.length;

  return (
    <div className="rounded-xl border border-border bg-surface-card p-4 shadow-[0_1px_3px_rgba(0,0,0,0.1)] dark:border-border dark:bg-surface-card">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-xs font-medium uppercase tracking-wide text-text-muted">
          🏆 Logros
        </h2>
        <p className="mt-1 text-sm text-text dark:text-text">
          {totalUnlocked} de {achievements.length} logros desbloqueados
        </p>
      </div>

      {/* Category tabs */}
      <div className="mb-4 flex flex-wrap gap-1" role="tablist">
        {categoryTabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeCategory === tab.id}
            onClick={() => setActiveCategory(tab.id)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
              activeCategory === tab.id
                ? "bg-success text-white dark:bg-success"
                : "bg-border text-text-muted hover:bg-surface dark:bg-border dark:text-text-muted dark:hover:bg-surface"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grid of achievements */}
      {filteredAchievements.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {filteredAchievements.map((achievement) => {
            const unlockedAt = unlockedMap.get(achievement.id);
            const currentValue = progressMap.get(achievement.id) ?? 0;
            const isUnlocked = !!unlockedAt;

            // Calculate progress percentage for locked achievements
            let progressPercent = 0;
            if (!isUnlocked && achievement.conditionValue) {
              const target = Number(achievement.conditionValue);
              if (target > 0) {
                progressPercent = Math.round((currentValue / target) * 100);
              }
            }

            return (
              <AchievementCard
                key={achievement.id}
                achievement={achievement}
                isUnlocked={isUnlocked}
                progress={isUnlocked ? 100 : progressPercent}
                unlockedAt={unlockedAt ? new Date(unlockedAt) : undefined}
                onClick={
                  onAchievementClick
                    ? () =>
                        onAchievementClick(
                          achievement,
                          unlockedAt ? new Date(unlockedAt) : undefined
                        )
                    : undefined
                }
              />
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <span className="mb-2 text-4xl opacity-30">🎯</span>
          <p className="text-sm text-text-muted">
            No hay logros en esta categoría
          </p>
        </div>
      )}
    </div>
  );
}
