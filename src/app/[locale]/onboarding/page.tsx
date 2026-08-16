import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";
import { setRequestLocale } from "next-intl/server";

async function getStep(searchParams: Promise<{ step?: string }>) {
  const params = await searchParams;
  const step = Number(params.step) || 1;
  return Math.max(1, Math.min(4, step));
}

export default async function OnboardingPage({
  searchParams,
  params,
}: {
  searchParams: Promise<{ step?: string }>;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const { userId } = await auth();
  if (!userId) {
    redirect(`/${locale}/sign-in`);
  }

  setRequestLocale(locale);
  const step = await getStep(searchParams);

  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <OnboardingWizard initialStep={step} locale={locale} />
    </Suspense>
  );
}
