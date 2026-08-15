"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AccountSectionProps {
  userId: string;
}

export function AccountSection({ userId }: AccountSectionProps) {
  const [sessions] = useState([
    { id: "1", device: "Chrome on macOS", lastActive: "Ahora mismo", current: true },
    { id: "2", device: "Safari on iPhone", lastActive: "Hace 2 horas", current: false },
  ]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cuenta</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Email */}
        <div className="space-y-2">
          <Label>Email</Label>
          <div className="flex items-center gap-3">
            <span className="text-sm text-text">Gestionado por Clerk</span>
            <Button variant="outline" size="sm" disabled>
              Cambiar email
            </Button>
          </div>
        </div>

        {/* Password */}
        <div className="space-y-2">
          <Label>Contraseña</Label>
          <div className="flex items-center gap-3">
            <span className="text-sm text-text-muted">••••••••</span>
            <Button variant="outline" size="sm" disabled>
              Cambiar contraseña
            </Button>
          </div>
        </div>

        {/* 2FA */}
        <div className="space-y-2">
          <Label>Autenticación en dos pasos</Label>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
              ✓ Activa
            </span>
            <Button variant="outline" size="sm" disabled>
              Desactivar
            </Button>
          </div>
        </div>

        {/* Active sessions */}
        <div className="space-y-3">
          <Label>Sesiones activas</Label>
          <div className="space-y-2">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between rounded-lg border border-border px-3 py-2"
              >
                <div>
                  <p className="text-sm text-text">{session.device}</p>
                  <p className="text-xs text-text-muted">{session.lastActive}</p>
                </div>
                {session.current && (
                  <span className="text-xs text-primary font-medium">Actual</span>
                )}
              </div>
            ))}
          </div>
          <Button variant="destructive" size="sm" disabled>
            Cerrar todas las sesiones
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
