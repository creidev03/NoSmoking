"use client";

import Link from "next/link";
import type { Achievement } from "@/lib/achievements/types";

interface UserAchievement {
  achievementId: string;
  unlockedAt: string;
}

interface RecentAchievementsWidgetProps {
  achievements: Achievement[];
  userAchievements: UserAchievement[];
  maxItems?: number;
}

export function RecentAchievementsWidget({
  achievements,
  userAchievements,
  maxItems = 3,
}: RecentAchievementsWidgetProps) {
  // Sort by unlockedAt desc and take top N
  const sorted = [...userAchievements]
    .sort((a, b) => new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime())
    .slice(0, maxItems);

  const achievementMap = new Map(achievements.map((a) => [a.id, a]));

  const remaining = userAchievements.length - sorted.length;

  return (
    <div className="rounded-xl border border-border bg-surface-card p-4 shadow-[0_1px_3px_rgba(0,0,0,0.1)] dark:border-border dark:bg-surface-card">
      <h2 className="mb-3 text-xs font-medium uppercase tracking-wide text-text-muted">
        📈 Tus últimos logros
      </h2>

      {sorted.length === 0 ? (
        <p className="text-sm text-text-muted">
          Aún no has desbloqueado logros. ¡Sigue intentando!
        </p>
      ) : (
        <div className="space-y-2">
          {sorted.map((ua) => {
            const achievement = achievementMap.get(ua.achievementId);
            if (!achievement) return null;

            return (
              <div
                key={ua.achievementId}
                className="flex items-center gap-3 rounded-lg border border-border p-3 bg-surface dark:border-border dark:bg-surface"
              >
                <span className="text-xl">{achievement.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text dark:text-text truncate">
                    {achievement.name}
                  </p>
                  <p className="text-[10px] text-text-muted">
                    {new Date(ua.unlockedAt).toLocaleDateString("es-ES", {
                      day: "numeric",
                      month: "short",
                    })}
                  </p>
                </div>
              </div>
            );
          })}

          {remaining > 0 && (
            <Link
              href="/dashboard/logros"
              className="block text-center text-xs font-medium text-primary hover:underline"
            >
              y {remaining} más →
            </Link>
          )}
        </div>
      )}

      {userAchievements.length > 0 && (
        <Link
          href="/dashboard/logros"
          className="mt-3 block text-center text-xs font-medium text-text-muted hover:text-primary"
        >
          Ver todos los logros
        </Link>
      )}
    </div>
  );
}
