"use client";

import { Button } from "@/components/ui/button";

const MOTIVATIONS = [
  { label: "Salud", value: "health", emoji: "❤️" },
  { label: "Familia", value: "family", emoji: "👨‍👩‍👧" },
  { label: "Dinero", value: "money", emoji: "💰" },
  { label: "Apariencia", value: "appearance", emoji: "✨" },
  { label: "Otro", value: "other", emoji: "📝" },
] as const;

interface MotivationStepProps {
  onSubmit: (value: string) => void;
  disabled?: boolean;
}

export function MotivationStep({ onSubmit, disabled }: MotivationStepProps) {
  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <div className="text-4xl">💪</div>
      <h2 className="text-xl font-semibold text-foreground">
        ¿Qué te motiva a dejar de fumar?
      </h2>
      <div className="flex flex-wrap justify-center gap-3">
        {MOTIVATIONS.map((motivation) => (
          <Button
            key={motivation.value}
            variant="outline"
            disabled={disabled}
            className="h-12 rounded-lg px-4 text-base transition-all hover:bg-accent hover:text-accent-foreground active:scale-95"
            onClick={() => onSubmit(motivation.value)}
          >
            <span>{motivation.emoji}</span>
            <span>{motivation.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
