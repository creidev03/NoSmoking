"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

const CIGARETTE_RANGES = [
  { label: "1-5", value: 3 },
  { label: "6-10", value: 8 },
  { label: "11-15", value: 13 },
  { label: "16-20", value: 18 },
  { label: "21-40", value: 30 },
  { label: "40+", value: 50 },
] as const;

interface CigarettesStepProps {
  onSubmit: (value: number) => void;
  disabled?: boolean;
}

export function CigarettesStep({ onSubmit, disabled }: CigarettesStepProps) {
  const t = useTranslations("onboarding");
  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <div className="text-4xl">🚬</div>
      <h2 className="text-xl font-semibold text-foreground">
        {t("cigarettes.question")}
      </h2>
      <div className="grid grid-cols-3 gap-3">
        {CIGARETTE_RANGES.map((range) => (
          <Button
            key={range.value}
            variant="outline"
            disabled={disabled}
            className="h-12 rounded-lg text-base transition-all hover:bg-accent hover:text-accent-foreground active:scale-95"
            onClick={() => onSubmit(range.value)}
          >
            {range.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
