"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

const MOTIVATION_VALUES = ["health", "family", "money", "appearance", "other"] as const;

const MOTIVATION_EMOJIS = {
  health: "❤️",
  family: "👨‍👩‍👧",
  money: "💰",
  appearance: "✨",
  other: "📝",
} as const;

interface MotivationStepProps {
  onSubmit: (value: string) => void;
  disabled?: boolean;
}

export function MotivationStep({ onSubmit, disabled }: MotivationStepProps) {
  const t = useTranslations("onboarding");
  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <div className="text-4xl">💪</div>
      <h2 className="text-xl font-semibold text-foreground">
        {t("motivation.question")}
      </h2>
      <div className="flex flex-wrap justify-center gap-3">
        {MOTIVATION_VALUES.map((value) => (
          <Button
            key={value}
            variant="outline"
            disabled={disabled}
            className="h-12 rounded-lg px-4 text-base transition-all hover:bg-accent hover:text-accent-foreground active:scale-95"
            onClick={() => onSubmit(value)}
          >
            <span>{MOTIVATION_EMOJIS[value]}</span>
            <span>{t(`motivation.${value}`)}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
