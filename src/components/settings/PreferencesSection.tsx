"use client";

import { useState } from "react";
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
  const [notifications, setNotifications] = useState(
    preferences?.notificationsEnabled ?? true
  );
  const [reminderInterval, setReminderInterval] = useState(
    preferences?.reminderInterval ?? "6h"
  );
  const [language, setLanguage] = useState(preferences?.language ?? "es");
  const [theme, setTheme] = useState(preferences?.theme ?? "auto");
  const [sounds, setSounds] = useState(preferences?.soundsEnabled ?? true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateUserPreferences(userId, {
        notificationsEnabled: notifications,
        reminderInterval,
        language,
        theme,
        soundsEnabled: sounds,
      });
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preferencias</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Notifications toggle */}
        <div className="flex items-center justify-between">
          <div>
            <Label>Notificaciones push</Label>
            <p className="text-xs text-text-muted">Recibe recordatorios para dejar de fumar</p>
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
          <Label>Intervalo de recordatorio</Label>
          <select
            value={reminderInterval}
            onChange={(e) => { setReminderInterval(e.target.value); setSaved(false); }}
            className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-text"
          >
            <option value="4h">Cada 4 horas</option>
            <option value="6h">Cada 6 horas</option>
            <option value="8h">Cada 8 horas</option>
            <option value="12h">Cada 12 horas</option>
          </select>
        </div>

        {/* Language */}
        <div className="space-y-2">
          <Label>Idioma</Label>
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
          <Label>Tema</Label>
          <select
            value={theme}
            onChange={(e) => { setTheme(e.target.value); setSaved(false); }}
            className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-text"
          >
            <option value="auto">Automático</option>
            <option value="light">Claro</option>
            <option value="dark">Oscuro</option>
          </select>
        </div>

        {/* Sounds toggle */}
        <div className="flex items-center justify-between">
          <div>
            <Label>Sonidos</Label>
            <p className="text-xs text-text-muted">Sonidos de notificación y efectos</p>
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
            {saving ? "Guardando..." : "Guardar preferencias"}
          </Button>
          {saved && (
            <span className="text-sm text-primary">✓ Guardado</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
