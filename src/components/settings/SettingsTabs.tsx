"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ProfileSection } from "./ProfileSection";
import { PreferencesSection } from "./PreferencesSection";
import { AccountSection } from "./AccountSection";
import { DataSection } from "./DataSection";
import { DangerZone } from "./DangerZone";
import type { UserProfile, UserPreferences } from "@/app/[locale]/dashboard/settings/actions";

interface SettingsTabsProps {
  userId: string;
  profile: UserProfile | null;
  preferences: UserPreferences | null;
}

const tabs = [
  { id: "profile", label: "Perfil", icon: "👤" },
  { id: "preferences", label: "Preferencias", icon: "🔔" },
  { id: "account", label: "Cuenta", icon: "🔐" },
  { id: "data", label: "Datos", icon: "📦" },
  { id: "danger", label: "Peligro", icon: "⚠️" },
] as const;

type TabId = (typeof tabs)[number]["id"];

export function SettingsTabs({ userId, profile, preferences }: SettingsTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>("profile");

  return (
    <div className="space-y-6">
      {/* Tab navigation */}
      <div className="flex gap-1 overflow-x-auto border-b border-border pb-px">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 whitespace-nowrap px-4 py-2.5 text-sm font-medium transition-colors rounded-t-lg",
              activeTab === tab.id
                ? "bg-primary/10 text-primary border-b-2 border-primary"
                : "text-text-muted hover:text-text hover:bg-accent"
            )}
          >
            <span>{tab.icon}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="min-h-[400px]">
        {activeTab === "profile" && (
          <ProfileSection userId={userId} profile={profile} />
        )}
        {activeTab === "preferences" && (
          <PreferencesSection userId={userId} preferences={preferences} />
        )}
        {activeTab === "account" && (
          <AccountSection userId={userId} />
        )}
        {activeTab === "data" && (
          <DataSection userId={userId} />
        )}
        {activeTab === "danger" && (
          <DangerZone userId={userId} />
        )}
      </div>
    </div>
  );
}
