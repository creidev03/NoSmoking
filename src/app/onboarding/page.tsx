import { Suspense } from "react";
import { redirect } from "next/navigation";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";

async function getStep(searchParams: Promise<{ step?: string }>) {
  const params = await searchParams;
  const step = Number(params.step) || 1;
  return Math.max(1, Math.min(4, step));
}

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ step?: string }>;
}) {
  const step = await getStep(searchParams);

  // TODO: Check if user has completed onboarding -> redirect to /dashboard
  // TODO: Check if user exists -> create or resume

  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <OnboardingWizard initialStep={step} />
    </Suspense>
  );
}
