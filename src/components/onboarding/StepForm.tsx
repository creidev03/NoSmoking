"use client";

import { CigarettesStep } from "./steps/CigarettesStep";
import { YearsStep } from "./steps/YearsStep";
import { MotivationStep } from "./steps/MotivationStep";
import { AttemptsStep } from "./steps/AttemptsStep";

interface StepFormProps {
  currentStep: number;
  onSubmit: (formData: FormData) => void;
  isPending: boolean;
}

export function StepForm({ currentStep, onSubmit, isPending }: StepFormProps) {
  function handleCigarettes(value: number) {
    const formData = new FormData();
    formData.set("cigarettes_per_day", String(value));
    onSubmit(formData);
  }

  function handleYears(value: number) {
    const formData = new FormData();
    formData.set("smoking_years", String(value));
    onSubmit(formData);
  }

  function handleMotivation(value: string) {
    const formData = new FormData();
    formData.set("motivation", value);
    onSubmit(formData);
  }

  function handleAttempts(value: number) {
    const formData = new FormData();
    formData.set("quit_attempts", String(value));
    onSubmit(formData);
  }

  switch (currentStep) {
    case 1:
      return (
        <CigarettesStep onSubmit={handleCigarettes} disabled={isPending} />
      );
    case 2:
      return <YearsStep onSubmit={handleYears} disabled={isPending} />;
    case 3:
      return (
        <MotivationStep onSubmit={handleMotivation} disabled={isPending} />
      );
    case 4:
      return <AttemptsStep onSubmit={handleAttempts} disabled={isPending} />;
    default:
      return null;
  }
}
