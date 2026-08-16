import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserProfile, getUserPreferences, getOnboardingResponses, getUserEmail } from "./actions";
import { SettingsTabs } from "@/components/settings/SettingsTabs";
import { setRequestLocale, getTranslations } from "next-intl/server";

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("settings");

  const { userId } = await auth();
  if (!userId) redirect(`/${locale}/sign-in`);

  const [profile, preferences, onboarding, userEmail] = await Promise.all([
    getUserProfile(userId),
    getUserPreferences(userId),
    getOnboardingResponses(userId),
    getUserEmail(userId),
  ]);

  const tc = await getTranslations("landing.credits");

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6 text-text">{t("title")}</h1>
      <SettingsTabs
        userId={userId}
        profile={profile}
        preferences={preferences}
        onboarding={onboarding}
        userEmail={userEmail.email}
      />
      <div className="mt-12 border-t border-border pt-6">
        <p className="text-sm text-muted-foreground text-center">
          {tc("settingsDesc")}{" · "}
          <a href="https://github.com/Crei03" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-foreground transition-colors">{tc("github")}</a>
          {" · "}
          <a href="mailto:creidev03@gmail.com" className="underline underline-offset-2 hover:text-foreground transition-colors">{tc("email")}</a>
        </p>
      </div>
    </div>
  );
}
