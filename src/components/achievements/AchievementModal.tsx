"use client";

import { useEffect, useRef } from "react";
import { useTranslations, useFormatter } from "next-intl";
import { cn } from "@/lib/utils";
import type { Achievement } from "@/lib/achievements/types";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const difficultyStars: Record<string, number> = {
  easy: 1,
  balanced: 2,
  medium: 3,
  hard: 4,
  extreme: 5,
};

interface AchievementModalProps {
  achievement: Achievement | null;
  isOpen: boolean;
  onClose: () => void;
  unlockedAt?: Date;
}

export function AchievementModal({
  achievement,
  isOpen,
  onClose,
  unlockedAt,
}: AchievementModalProps) {
  const t = useTranslations("achievements");
  const format = useFormatter();
  const dialogRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!isOpen || !achievement) return null;

  const stars = difficultyStars[achievement.difficulty] ?? 1;
  const translatedName = t(`${achievement.id}.name`);
  const translatedDesc = t(`${achievement.id}.description`);
  const displayName = translatedName !== `${achievement.id}.name` ? translatedName : achievement.name;
  const displayDesc = translatedDesc !== `${achievement.id}.description` ? translatedDesc : achievement.description;
  const difficultyLabel = t(`difficulty.${achievement.difficulty}`) !== `difficulty.${achievement.difficulty}`
    ? t(`difficulty.${achievement.difficulty}`)
    : achievement.difficulty;

  return (
    <div
      data-testid="achievement-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={displayName}
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "relative mx-4 w-full max-w-sm rounded-2xl border p-8 shadow-xl",
          "border-success-soft bg-white dark:border-success dark:bg-surface-card",
          "animate-in fade-in zoom-in-95 duration-200"
        )}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          aria-label={t("close")}
        >
          ✕
        </button>

        {/* Icon (large) */}
        <div className="mb-4 flex justify-center">
          {achievement.icon.startsWith("/") ? (
            <img
              src={achievement.icon}
              alt={achievement.name}
              className="h-24 w-24"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/achievements/default.svg";
              }}
            />
          ) : (
            <span className="text-6xl">{achievement.icon}</span>
          )}
        </div>

        {/* Name */}
        <h2 className="text-center text-xl font-bold text-gray-900 dark:text-gray-100">
          {displayName}
        </h2>

        {/* Description */}
        <p className="mt-3 text-center text-sm leading-relaxed text-gray-600 dark:text-gray-400">
          {displayDesc}
        </p>

        {/* Difficulty stars */}
        <div className="mt-4 flex items-center justify-center gap-1">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {difficultyLabel}
          </span>
          <span aria-label={`${stars} de 5`} className="ml-1">
            {Array.from({ length: stars })
              .map(() => "⭐")
              .join("")}
          </span>
        </div>

        {/* Unlocked date */}
        {unlockedAt && (
          <p className="mt-4 text-center text-xs text-gray-400 dark:text-gray-500">
            {t("unlocked", { date: format.dateTime(unlockedAt, { dateStyle: "medium" }) })}
          </p>
        )}

        {/* Buttons */}
        <div className="mt-8 flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={async () => {
              const text = t("shareMessage", { name: displayName, description: displayDesc });
              try {
                if (navigator.share) {
                  await navigator.share({ title: displayName, text });
                } else {
                  throw new Error("no share");
                }
              } catch {
                await navigator.clipboard.writeText(text);
                toast.success(t("copied"), {
                  description: t("copiedDescription"),
                });
              }
            }}
          >
            {t("share")}
          </Button>
          <Button variant="default" className="flex-1" onClick={onClose}>
            {t("understood")}
          </Button>
        </div>
      </div>
    </div>
  );
}
