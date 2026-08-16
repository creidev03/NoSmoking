"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

const YEAR_RANGES = [
  { translationKey: "under1Year", value: 0 },
  { translationKey: "1to5Years", value: 3 },
  { translationKey: "5to10Years", value: 7 },
  { translationKey: "over10Years", value: 15 },
] as const;

interface YearsStepProps {
  onSubmit: (value: number) => void;
  disabled?: boolean;
}

export function YearsStep({ onSubmit, disabled }: YearsStepProps) {
  const t = useTranslations("onboarding");
  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <div className="text-4xl">⏳</div>
      <h2 className="text-xl font-semibold text-foreground">
        {t("years.question")}
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {YEAR_RANGES.map((range) => (
          <Button
            key={range.value}
            variant="outline"
            disabled={disabled}
            className="h-12 rounded-lg text-base transition-all hover:bg-accent hover:text-accent-foreground active:scale-95"
            onClick={() => onSubmit(range.value)}
          >
            {t(`years.${range.translationKey}`)}
          </Button>
        ))}
      </div>
    </div>
  );
}
