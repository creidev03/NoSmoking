"use client";

import { Button } from "@/components/ui/button";

const ATTEMPT_RANGES = [
  { label: "0", value: 0 },
  { label: "1-2", value: 1 },
  { label: "3-4", value: 3 },
  { label: "5+", value: 5 },
] as const;

interface AttemptsStepProps {
  onSubmit: (value: number) => void;
  disabled?: boolean;
}

export function AttemptsStep({ onSubmit, disabled }: AttemptsStepProps) {
  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <div className="text-4xl">🔄</div>
      <h2 className="text-xl font-semibold text-gray-900">
        ¿Cuántos intentos previos has tenido?
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {ATTEMPT_RANGES.map((range) => (
          <Button
            key={range.value}
            variant="outline"
            disabled={disabled}
            className="h-12 rounded-lg border-gray-200 bg-white/80 text-base backdrop-blur transition-all hover:bg-emerald-50 hover:text-emerald-700 active:scale-95"
            onClick={() => onSubmit(range.value)}
          >
            {range.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
