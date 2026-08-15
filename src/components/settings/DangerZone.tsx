"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { resetProgress } from "@/app/dashboard/settings/actions";

interface DangerZoneProps {
  userId: string;
}

export function DangerZone({ userId }: DangerZoneProps) {
  const [showResetModal, setShowResetModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [resetConfirm, setResetConfirm] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [resetting, setResetting] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  const handleReset = async () => {
    if (resetConfirm !== "REINICIAR") return;
    setResetting(true);
    try {
      await resetProgress(userId);
      setResetDone(true);
      setShowResetModal(false);
      setResetConfirm("");
    } finally {
      setResetting(false);
    }
  };

  const handleDelete = () => {
    // Account deletion placeholder — Clerk manages this
    setShowDeleteModal(false);
    setDeleteConfirm("");
  };

  return (
    <>
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="text-destructive">⚠️ Zona de peligro</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Reset progress */}
          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-medium text-text">Reiniciar progreso</h3>
              <p className="text-xs text-text-muted">
                Esto borrará todas tus vidas, días, logros y eventos. No se puede deshacer.
              </p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              data-testid="reset-progress-btn"
              onClick={() => setShowResetModal(true)}
            >
              Reiniciar progreso
            </Button>
            {resetDone && (
              <p className="text-sm text-primary">✓ Progreso reiniciado correctamente</p>
            )}
          </div>

          {/* Delete account */}
          <div className="space-y-3 border-t border-border pt-6">
            <div>
              <h3 className="text-sm font-medium text-text">Eliminar cuenta</h3>
              <p className="text-xs text-text-muted">
                Esto eliminará permanentemente tu cuenta y todos tus datos. No se puede deshacer.
              </p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              data-testid="delete-account-btn"
              onClick={() => setShowDeleteModal(true)}
            >
              Eliminar cuenta
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reset confirmation modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-md rounded-xl bg-card p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-text mb-2">
              ⚠️ Reiniciar progreso
            </h3>
            <p className="text-sm text-text-muted mb-4">
              Esto borrará <strong>todas tus vidas, días, logros y eventos</strong>.
              Esta acción no se puede deshacer.
            </p>
            <p className="text-sm text-text-muted mb-4">
              Escribe <strong>REINICIAR</strong> para confirmar:
            </p>
            <input
              type="text"
              value={resetConfirm}
              onChange={(e) => setResetConfirm(e.target.value)}
              placeholder="REINICIAR"
              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-text mb-4"
            />
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => { setShowResetModal(false); setResetConfirm(""); }}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                disabled={resetConfirm !== "REINICIAR" || resetting}
                onClick={handleReset}
              >
                {resetting ? "Reiniciando..." : "Reiniciar"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-md rounded-xl bg-card p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-text mb-2">
              🗑️ Eliminar cuenta
            </h3>
            <p className="text-sm text-text-muted mb-4">
              Esto eliminará permanentemente tu cuenta y <strong>todos tus datos</strong>.
              Esta acción no se puede deshacer.
            </p>
            <p className="text-sm text-text-muted mb-4">
              Escribe tu email para confirmar:
            </p>
            <input
              type="email"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder="tu@email.com"
              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-text mb-4"
            />
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => { setShowDeleteModal(false); setDeleteConfirm(""); }}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                data-testid="confirm-delete-btn"
                disabled={!deleteConfirm.includes("@")}
                onClick={handleDelete}
              >
                Eliminar cuenta
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
