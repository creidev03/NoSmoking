"use client";

import { useState, useTransition } from "react";
import { submitStep, completeOnboarding } from "@/app/onboarding/actions";
import { StepIndicator } from "./StepIndicator";
import { StepForm } from "./StepForm";

interface OnboardingWizardProps {
  initialStep: number;
}

export function OnboardingWizard({ initialStep }: OnboardingWizardProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleStepSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        const result = await submitStep("stub-user-id", initialStep, formData);
        if (result.nextStep > 4) {
          await completeOnboarding("stub-user-id");
        }
        // In real app, would update URL params via router.push
      } catch (e) {
        setError(
          e instanceof Error ? e.message : "Ocurrió un error. Intenta de nuevo."
        );
      }
    });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-emerald-50 p-4">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-white/20 bg-white/80 p-8 shadow-lg backdrop-blur">
        <StepIndicator currentStep={initialStep} totalSteps={4} />
        {error && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}
        <StepForm
          currentStep={initialStep}
          onSubmit={handleStepSubmit}
          isPending={isPending}
        />
      </div>
    </div>
  );
}
