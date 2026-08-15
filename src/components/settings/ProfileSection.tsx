"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateUserProfile } from "@/app/dashboard/settings/actions";
import type { UserProfile } from "@/app/dashboard/settings/actions";

interface ProfileSectionProps {
  userId: string;
  profile: UserProfile | null;
}

const MOTIVATION_OPTIONS = [
  { id: "salud", label: "Salud", icon: "❤️" },
  { id: "dinero", label: "Dinero", icon: "💰" },
  { id: "familia", label: "Familia", icon: "👨‍👩‍👧‍👦" },
];

export function ProfileSection({ userId, profile }: ProfileSectionProps) {
  const [motivations, setMotivations] = useState<string[]>(
    profile?.motivations ?? []
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const toggleMotivation = (id: string) => {
    setMotivations((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateUserProfile(userId, { motivations });
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Perfil</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center text-3xl">
            {profile?.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt="Avatar"
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              <span>👤</span>
            )}
          </div>
          <div>
            <p className="text-sm text-text-muted">
              Tu avatar se gestiona desde tu cuenta de Clerk
            </p>
          </div>
        </div>

        {/* Email (read-only) */}
        <div className="space-y-2">
          <Label>Email</Label>
          <input
            type="email"
            disabled
            value="Gestionado por Clerk"
            className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-text-muted"
          />
        </div>

        {/* Motivations */}
        <div className="space-y-3">
          <Label>Motivaciones para dejar de fumar</Label>
          <div className="flex flex-wrap gap-3">
            {MOTIVATION_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => toggleMotivation(opt.id)}
                className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                  motivations.includes(opt.id)
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card text-text-muted hover:bg-accent"
                }`}
              >
                <span>{opt.icon}</span>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Save */}
        <div className="flex items-center gap-3">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Guardando..." : "Guardar cambios"}
          </Button>
          {saved && (
            <span className="text-sm text-primary">✓ Guardado</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
