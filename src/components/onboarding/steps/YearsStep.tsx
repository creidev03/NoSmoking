"use client";

import { Button } from "@/components/ui/button";

const YEAR_RANGES = [
  { label: "< 1 año", value: 0 },
  { label: "1-5 años", value: 3 },
  { label: "5-10 años", value: 7 },
  { label: "10+ años", value: 15 },
] as const;

interface YearsStepProps {
  onSubmit: (value: number) => void;
  disabled?: boolean;
}

export function YearsStep({ onSubmit, disabled }: YearsStepProps) {
  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <div className="text-4xl">⏳</div>
      <h2 className="text-xl font-semibold text-foreground">
        ¿Hace cuánto tiempo fumas?
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
            {range.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
