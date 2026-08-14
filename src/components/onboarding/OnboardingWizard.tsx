"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { submitStep, completeOnboarding } from "@/app/onboarding/actions";
import { StepIndicator } from "./StepIndicator";
import { StepForm } from "./StepForm";

interface OnboardingWizardProps {
  initialStep: number;
}

export function OnboardingWizard({ initialStep }: OnboardingWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleStepSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        const result = await submitStep("stub-user-id", currentStep, formData);
        if (result.nextStep > 4) {
          await completeOnboarding("stub-user-id");
          router.push("/dashboard");
        } else {
          setCurrentStep(result.nextStep);
        }
      } catch (e) {
        setError(
          e instanceof Error ? e.message : "Ocurrió un error. Intenta de nuevo."
        );
      }
    });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-400 to-emerald-200 p-4 dark:from-blue-900 dark:to-emerald-900">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-border bg-card p-8 shadow-lg">
        <StepIndicator currentStep={currentStep} totalSteps={4} />
        {error && (
          <div
            role="alert"
            className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive"
          >
            {error}
          </div>
        )}
        <StepForm
          currentStep={currentStep}
          onSubmit={handleStepSubmit}
          isPending={isPending}
        />
      </div>
    </div>
  );
}
