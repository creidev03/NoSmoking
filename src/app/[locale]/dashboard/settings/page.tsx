import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserProfile, getUserPreferences } from "./actions";
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

  const [profile, preferences] = await Promise.all([
    getUserProfile(userId),
    getUserPreferences(userId),
  ]);

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6 text-text">{t("title")}</h1>
      <SettingsTabs userId={userId} profile={profile} preferences={preferences} />
    </div>
  );
}
