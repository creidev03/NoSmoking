"use client";

import React from "react";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  return (
    <nav aria-label="Onboarding progress">
      <ol className="flex items-center justify-center gap-2">
        {Array.from({ length: totalSteps }, (_, i) => {
          const step = i + 1;
          const isCompleted = step < currentStep;
          const isActive = step === currentStep;

          return (
            <li
              key={step}
              aria-current={isActive ? "step" : undefined}
              aria-label={
                isCompleted
                  ? `Step ${step} completed`
                  : isActive
                    ? `Step ${step} current`
                    : `Step ${step}`
              }
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                isActive
                  ? "bg-emerald-500 text-white"
                  : isCompleted
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-gray-200 text-gray-500"
              }`}
            >
              {isCompleted ? "✓" : step}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
