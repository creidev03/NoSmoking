"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import type { Achievement } from "@/lib/achievements/types";
import { AchievementCard } from "./AchievementCard";
import { AchievementModal } from "./AchievementModal";

interface UserAchievement {
  achievementId: string;
  unlockedAt: string;
}

interface AchievementProgress {
  achievementId: string;
  currentValue: number;
}

interface AchievementsViewProps {
  achievements: Achievement[];
  userAchievements: UserAchievement[];
  userId: string;
}

type CategoryFilter =
  | "all"
  | "time"
  | "progress"
  | "actions"
  | "challenges"
  | "collection"
  | "awareness";

const categoryTabs: { id: CategoryFilter; label: string }[] = [
  { id: "all", label: "Todos" },
  { id: "time", label: "Tiempo" },
  { id: "progress", label: "Progreso" },
  { id: "actions", label: "Acciones" },
  { id: "challenges", label: "Desafíos" },
  { id: "collection", label: "Colecciones" },
  { id: "awareness", label: "Consciencia" },
];

const ITEMS_PER_PAGE = 12;

export function AchievementsView({
  achievements,
  userAchievements,
  userId,
}: AchievementsViewProps) {
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("all");
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [selectedUnlockedAt, setSelectedUnlockedAt] = useState<Date | undefined>(undefined);

  // Create lookup maps
  const unlockedMap = useMemo(
    () => new Map(userAchievements.map((ua) => [ua.achievementId, ua.unlockedAt])),
    [userAchievements]
  );

  const progressMap = useMemo(() => {
    const map = new Map<string, number>();
    // Initialize all achievements with 0 progress
    achievements.forEach((a) => map.set(a.id, 0));
    return map;
  }, [achievements]);

  // Filter achievements by category
  const filteredAchievements = useMemo(() => {
    return activeCategory === "all"
      ? achievements
      : achievements.filter((a) => a.category === activeCategory);
  }, [achievements, activeCategory]);

  // Count unlocked and percentage
  const totalUnlocked = userAchievements.length;
  const percentage = achievements.length > 0 ? Math.round((totalUnlocked / achievements.length) * 100) : 0;

  // Paginated achievements
  const visibleAchievements = filteredAchievements.slice(0, visibleCount);
  const hasMore = visibleCount < filteredAchievements.length;

  const handleAchievementClick = (achievement: Achievement, unlockedAt?: Date) => {
    setSelectedAchievement(achievement);
    setSelectedUnlockedAt(unlockedAt);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text dark:text-text">
          🏆 Tus Logros
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          {totalUnlocked} de {achievements.length} desbloqueados ({percentage}%)
        </p>
      </div>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-2" role="tablist">
        {categoryTabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeCategory === tab.id}
            onClick={() => {
              setActiveCategory(tab.id);
              setVisibleCount(ITEMS_PER_PAGE);
            }}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              activeCategory === tab.id
                ? "bg-primary text-white"
                : "bg-border text-text-muted hover:bg-surface dark:bg-border dark:text-text-muted dark:hover:bg-surface"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Achievement grid */}
      {visibleAchievements.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibleAchievements.map((achievement) => {
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
                onClick={() =>
                  handleAchievementClick(
                    achievement,
                    unlockedAt ? new Date(unlockedAt) : undefined
                  )
                }
              />
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <span className="mb-3 text-5xl opacity-30">🎯</span>
          <p className="text-sm text-text-muted">
            No hay logros en esta categoría
          </p>
        </div>
      )}

      {/* Load more button */}
      {hasMore && (
        <div className="flex justify-center">
          <button
            onClick={() => setVisibleCount((prev) => prev + ITEMS_PER_PAGE)}
            className="rounded-lg border border-border px-6 py-2 text-sm font-medium text-text-muted transition-colors hover:bg-surface dark:border-border dark:text-text-muted dark:hover:bg-surface"
          >
            Cargar más ({visibleCount} de {filteredAchievements.length})
          </button>
        </div>
      )}

      {/* Achievement detail modal */}
      <AchievementModal
        achievement={selectedAchievement}
        isOpen={!!selectedAchievement}
        onClose={() => {
          setSelectedAchievement(null);
          setSelectedUnlockedAt(undefined);
        }}
        unlockedAt={selectedUnlockedAt}
      />
    </div>
  );
}
