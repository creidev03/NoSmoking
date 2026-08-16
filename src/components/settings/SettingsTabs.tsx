"use client";

import { useState, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import { User, Bell, Database } from "lucide-react";
import { useTranslations } from "next-intl";
import { ProfileSection } from "./ProfileSection";
import { PreferencesSection } from "./PreferencesSection";
import { DataSection } from "./DataSection";
import type { UserProfile, UserPreferences, OnboardingData } from "@/app/[locale]/dashboard/settings/actions";

interface SettingsTabsProps {
  userId: string;
  profile: UserProfile | null;
  preferences: UserPreferences | null;
  onboarding: OnboardingData | null;
  userEmail: string | null;
}

type TabId = "profile" | "preferences" | "data";

function getTabFromURL(): TabId {
  if (typeof window === "undefined") return "profile";
  const params = new URLSearchParams(window.location.search);
  const tab = params.get("tab");
  if (tab && ["profile", "preferences", "data"].includes(tab)) return tab as TabId;
  return "profile";
}

export function SettingsTabs({ userId, profile, preferences, onboarding, userEmail }: SettingsTabsProps) {
  const t = useTranslations("settings");
  const [activeTab, setActiveTabState] = useState<TabId>("profile");

  const tabs = [
    { id: "profile" as const, label: t("tabs.profile"), Icon: User },
    { id: "preferences" as const, label: t("tabs.preferences"), Icon: Bell },
    { id: "data" as const, label: t("tabs.data"), Icon: Database },
  ];

  // Read tab from URL on mount
  useEffect(() => {
    setActiveTabState(getTabFromURL());
  }, []);

  const setActiveTab = useCallback((tab: TabId) => {
    setActiveTabState(tab);
    // Update URL without reload to preserve tab across navigation
    const url = new URL(window.location.href);
    url.searchParams.set("tab", tab);
    window.history.replaceState({}, "", url.toString());
  }, []);

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
            <tab.Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="min-h-[400px]">
        {activeTab === "profile" && (
          <ProfileSection
            userId={userId}
            profile={profile}
            onboarding={onboarding}
            userEmail={userEmail}
          />
        )}
        {activeTab === "preferences" && (
          <PreferencesSection userId={userId} preferences={preferences} />
        )}
        {activeTab === "data" && (
          <DataSection userId={userId} />
        )}
      </div>
    </div>
  );
}
