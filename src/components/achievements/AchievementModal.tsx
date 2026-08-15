"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import type { Achievement } from "@/lib/achievements/types";
import { Button } from "@/components/ui/button";

const difficultyLabels: Record<string, string> = {
  easy: "Fácil",
  balanced: "Equilibrado",
  medium: "Medio",
  hard: "Difícil",
  extreme: "Extremo",
};

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
        aria-label={achievement.name}
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "relative mx-4 w-full max-w-sm rounded-2xl border p-8 shadow-xl",
          "border-[#D1FAE5] bg-white dark:border-[#065F46] dark:bg-[#1F2937]",
          "animate-in fade-in zoom-in-95 duration-200"
        )}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          aria-label="Cerrar"
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
          {achievement.name}
        </h2>

        {/* Description */}
        <p className="mt-3 text-center text-sm leading-relaxed text-gray-600 dark:text-gray-400">
          {achievement.description}
        </p>

        {/* Difficulty stars */}
        <div className="mt-4 flex items-center justify-center gap-1">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {difficultyLabels[achievement.difficulty]}
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
            Desbloqueado: {unlockedAt.toLocaleDateString("es-ES")}
          </p>
        )}

        {/* Buttons */}
        <div className="mt-8 flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={async () => {
              const text = `🏆 ¡Desbloqueé "${achievement.name}" en No Smoking!\n\n${achievement.description}\n\n#DejarDeFumar #NoSmoking`;
              if (navigator.share) {
                try {
                  await navigator.share({ title: achievement.name, text });
                } catch {
                  // user cancelled
                }
              } else {
                await navigator.clipboard.writeText(text);
              }
            }}
          >
            COMPARTIR
          </Button>
          <Button variant="default" className="flex-1" onClick={onClose}>
            ENTENDIDO
          </Button>
        </div>
      </div>
    </div>
  );
}
