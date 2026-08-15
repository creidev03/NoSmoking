"use client";

import { cn } from "@/lib/utils";
import type { Achievement } from "@/lib/achievements/types";

interface AchievementCardProps {
  achievement: Achievement;
  isUnlocked: boolean;
  progress: number;
  unlockedAt?: Date;
  onClick?: () => void;
}

const categoryColors: Record<string, { bg: string; border: string; text: string }> = {
  time: {
    bg: "bg-amber-50 dark:bg-amber-950/30",
    border: "border-amber-200 dark:border-amber-800",
    text: "text-amber-700 dark:text-amber-400",
  },
  progress: {
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    border: "border-emerald-200 dark:border-emerald-800",
    text: "text-emerald-700 dark:text-emerald-400",
  },
  actions: {
    bg: "bg-blue-50 dark:bg-blue-950/30",
    border: "border-blue-200 dark:border-blue-800",
    text: "text-blue-700 dark:text-blue-400",
  },
  challenges: {
    bg: "bg-purple-50 dark:bg-purple-950/30",
    border: "border-purple-200 dark:border-purple-800",
    text: "text-purple-700 dark:text-purple-400",
  },
  collection: {
    bg: "bg-rose-50 dark:bg-rose-950/30",
    border: "border-rose-200 dark:border-rose-800",
    text: "text-rose-700 dark:text-rose-400",
  },
  awareness: {
    bg: "bg-slate-50 dark:bg-slate-950/30",
    border: "border-slate-200 dark:border-slate-800",
    text: "text-slate-700 dark:text-slate-400",
  },
};

const difficultyLabels: Record<string, string> = {
  easy: "Fácil",
  balanced: "Equilibrado",
  medium: "Medio",
  hard: "Difícil",
  extreme: "Extremo",
};

export function AchievementCard({
  achievement,
  isUnlocked,
  progress,
  unlockedAt,
  onClick,
}: AchievementCardProps) {
  const colors = categoryColors[achievement.category] ?? categoryColors.time;
  const showSecret = !achievement.isSecret || isUnlocked;
  const displayName = showSecret ? achievement.name : "???";
  const displayDescription = showSecret ? achievement.description : "";

  return (
    <div
      data-testid={`achievement-card-${achievement.id}`}
      data-unlocked={isUnlocked}
      className={cn(
        "relative flex flex-col rounded-xl border p-4 transition-all",
        isUnlocked
          ? cn(colors.bg, colors.border, "shadow-sm")
          : "border-gray-200 bg-gray-50 opacity-60 dark:border-gray-700 dark:bg-gray-900",
        onClick && "cursor-pointer hover:shadow-md"
      )}
      onClick={onClick}
    >
      {/* Icon */}
      <div className="mb-2 flex items-center justify-between">
        <span className="text-2xl" aria-hidden="true">
          {isUnlocked || !achievement.isSecret ? achievement.icon : "🔒"}
        </span>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[10px] font-medium uppercase",
            isUnlocked
              ? cn(colors.bg, colors.text)
              : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
          )}
        >
          {difficultyLabels[achievement.difficulty] ?? achievement.difficulty}
        </span>
      </div>

      {/* Name */}
      <h3
        className={cn(
          "text-sm font-semibold",
          isUnlocked
            ? "text-gray-900 dark:text-gray-100"
            : "text-gray-500 dark:text-gray-400"
        )}
      >
        {displayName}
      </h3>

      {/* Description */}
      {showSecret && (
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {displayDescription}
        </p>
      )}

      {/* Progress bar (only for locked with progress) */}
      {!isUnlocked && progress > 0 && (
        <div className="mt-3">
          <div className="mb-1 flex items-center justify-between text-[10px] text-gray-500">
            <span>Progreso</span>
            <span>{Math.min(progress, 100)}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              className="h-full rounded-full bg-gray-400 transition-all dark:bg-gray-500"
              style={{ width: `${Math.min(progress, 100)}%` }}
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>
      )}

      {/* Unlock date */}
      {isUnlocked && unlockedAt && (
        <p className="mt-2 text-[10px] text-gray-400 dark:text-gray-500">
          Desbloqueado: {unlockedAt.toLocaleDateString("es-ES")}
        </p>
      )}
    </div>
  );
}
