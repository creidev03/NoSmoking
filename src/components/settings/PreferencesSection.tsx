"use client";

import { useState, useEffect, useRef } from "react";
import { useTheme } from "@/hooks/useTheme";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateUserPreferences } from "@/app/[locale]/dashboard/settings/actions";
import type { UserPreferences } from "@/app/[locale]/dashboard/settings/actions";

interface PreferencesSectionProps {
  userId: string;
  preferences: UserPreferences | null;
}

export function PreferencesSection({ userId, preferences }: PreferencesSectionProps) {
  const { setTheme } = useTheme(preferences?.theme as "light" | "dark" | "system" | undefined);
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("settings");
  const redirectGuard = useRef(false);

  const [notifications, setNotifications] = useState(
    preferences?.notificationsEnabled ?? true
  );
  const [reminderInterval, setReminderInterval] = useState(
    preferences?.reminderInterval ?? "6h"
  );
  const [language, setLanguage] = useState(preferences?.language ?? "es");
  const [themeLocal, setThemeLocal] = useState(preferences?.theme ?? "auto");
  const [sounds, setSounds] = useState(preferences?.soundsEnabled ?? true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Sync theme from DB to shared state on mount
  useEffect(() => {
    if (preferences?.theme) {
      const themeValue = preferences.theme as "light" | "dark" | "system";
      setTheme(themeValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync language from DB on mount — redirect if DB locale ≠ URL locale
  useEffect(() => {
    if (preferences?.language && preferences.language !== locale && !redirectGuard.current) {
      redirectGuard.current = true;
      router.replace(`${pathname}?tab=preferences`, { locale: preferences.language });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateUserPreferences({
        notificationsEnabled: notifications,
        reminderInterval,
        language,
        theme: themeLocal,
        soundsEnabled: sounds,
      });

      // Apply theme immediately to DOM + localStorage
      setTheme(themeLocal as "light" | "dark" | "system");

      // Redirect if language changed
      if (language !== locale) {
        router.replace(`${pathname}?tab=preferences`, { locale: language });
      }

      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("preferences.title")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Notifications toggle */}
        <div className="flex items-center justify-between">
          <div>
            <Label>{t("preferences.notifications")}</Label>
            <p className="text-xs text-text-muted">{t("preferences.notificationsDesc")}</p>
          </div>
          <button
            onClick={() => { setNotifications(!notifications); setSaved(false); }}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              notifications ? "bg-primary" : "bg-muted"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                notifications ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {/* Reminder interval */}
        <div className="space-y-2">
          <Label>{t("preferences.reminderInterval")}</Label>
          <select
            value={reminderInterval}
            onChange={(e) => { setReminderInterval(e.target.value); setSaved(false); }}
            className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-text"
          >
            <option value="4h">{t("preferences.every4h")}</option>
            <option value="6h">{t("preferences.every6h")}</option>
            <option value="8h">{t("preferences.every8h")}</option>
            <option value="12h">{t("preferences.every12h")}</option>
          </select>
        </div>

        {/* Language */}
        <div className="space-y-2">
          <Label>{t("preferences.language")}</Label>
          <select
            value={language}
            onChange={(e) => { setLanguage(e.target.value); setSaved(false); }}
            className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-text"
          >
            <option value="es">Español</option>
            <option value="en">English</option>
          </select>
        </div>

        {/* Theme */}
        <div className="space-y-2">
          <Label>{t("preferences.theme")}</Label>
          <select
            value={themeLocal}
            onChange={(e) => { setThemeLocal(e.target.value); setSaved(false); }}
            className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-text"
          >
            <option value="auto">{t("preferences.auto")}</option>
            <option value="light">{t("preferences.light")}</option>
            <option value="dark">{t("preferences.dark")}</option>
          </select>
        </div>

        {/* Sounds toggle */}
        <div className="flex items-center justify-between">
          <div>
            <Label>{t("preferences.sounds")}</Label>
            <p className="text-xs text-text-muted">{t("preferences.soundsDesc")}</p>
          </div>
          <button
            onClick={() => { setSounds(!sounds); setSaved(false); }}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              sounds ? "bg-primary" : "bg-muted"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                sounds ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {/* Save */}
        <div className="flex items-center gap-3">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? t("preferences.saving") : t("preferences.save")}
          </Button>
          {saved && (
            <span className="text-sm text-primary">{t("preferences.saved")}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
