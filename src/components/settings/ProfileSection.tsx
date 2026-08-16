"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from "next-intl";
import { updateUserProfile, updateOnboardingMotivation } from "@/app/[locale]/dashboard/settings/actions";
import type { UserProfile, OnboardingData } from "@/app/[locale]/dashboard/settings/actions";
import { Heart, Banknote, Users, Mail, Cigarette, Calendar, RotateCcw, Bell, User } from "lucide-react";

interface ProfileSectionProps {
  userId: string;
  profile: UserProfile | null;
  onboarding: OnboardingData | null;
  userEmail: string | null;
}

export function ProfileSection({ userId, profile, onboarding, userEmail }: ProfileSectionProps) {
  const t = useTranslations("settings");
  const [motivations, setMotivations] = useState<string[]>(
    profile?.motivations ?? []
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const motivationOptions = [
    { id: "salud", label: t("profile.health"), Icon: Heart },
    { id: "dinero", label: t("profile.money"), Icon: Banknote },
    { id: "familia", label: t("profile.family"), Icon: Users },
  ];

  const toggleMotivation = (id: string) => {
    setMotivations((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateUserProfile({ motivations });
      if (onboarding?.motivation) {
        await updateOnboardingMotivation(motivations.join(", "));
      }
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          {t("profile.title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Email (read-only) */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            {t("profile.email")}
          </Label>
          <input
            type="email"
            disabled
            value={userEmail || t("profile.emailNotAvailable")}
            className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-text-muted"
          />
        </div>

        {/* Onboarding data - read-only */}
        {onboarding && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-text">{t("profile.onboardingTitle")}</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Cigarettes per day */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-text-muted">
                  <Cigarette className="h-4 w-4" />
                  {t("profile.cigarettesPerDay")}
                </Label>
                <input
                  type="text"
                  disabled
                  value={onboarding.cigarettesPerDay ?? t("profile.notSpecified")}
                  className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-text-muted"
                />
              </div>

              {/* Smoking years */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-text-muted">
                  <Calendar className="h-4 w-4" />
                  {t("profile.smokingYears")}
                </Label>
                <input
                  type="text"
                  disabled
                  value={onboarding.smokingYears ? `${onboarding.smokingYears} años` : t("profile.notSpecified")}
                  className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-text-muted"
                />
              </div>

              {/* Quit attempts */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-text-muted">
                  <RotateCcw className="h-4 w-4" />
                  {t("profile.quitAttempts")}
                </Label>
                <input
                  type="text"
                  disabled
                  value={onboarding.quitAttempts ?? t("profile.notSpecified")}
                  className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-text-muted"
                />
              </div>

              {/* Notifications */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-text-muted">
                  <Bell className="h-4 w-4" />
                  {t("profile.notifications")}
                </Label>
                <input
                  type="text"
                  disabled
                  value={onboarding.notificationEnabled ? t("profile.notificationsEnabled") : t("profile.notificationsDisabled")}
                  className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-text-muted"
                />
              </div>
            </div>
          </div>
        )}

        {/* Motivations (editable) */}
        <div className="space-y-3">
          <Label>{t("profile.motivations")}</Label>
          <div className="flex flex-wrap gap-3">
            {motivationOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => toggleMotivation(opt.id)}
                className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                  motivations.includes(opt.id)
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card text-text-muted hover:bg-accent"
                }`}
              >
                <opt.Icon className="h-4 w-4" />
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Save */}
        <div className="flex items-center gap-3">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? t("profile.saving") : t("profile.save")}
          </Button>
          {saved && (
            <span className="text-sm text-primary">{t("profile.saved")}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
