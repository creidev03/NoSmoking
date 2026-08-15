import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getUserProfile, getUserPreferences } from "./actions";
import { SettingsTabs } from "@/components/settings/SettingsTabs";

export default async function SettingsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const [profile, preferences] = await Promise.all([
    getUserProfile(userId),
    getUserPreferences(userId),
  ]);

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6 text-text">⚙️ Configuración</h1>
      <SettingsTabs userId={userId} profile={profile} preferences={preferences} />
    </div>
  );
}
