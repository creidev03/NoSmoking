"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from "next-intl";
import { resetProgress } from "@/app/[locale]/dashboard/settings/actions";

interface DangerZoneProps {
  userId: string;
}

export function DangerZone({ userId }: DangerZoneProps) {
  const t = useTranslations("settings");
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
          <CardTitle className="text-destructive">⚠️ {t("danger.title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Reset progress */}
          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-medium text-text">{t("danger.resetProgress")}</h3>
              <p className="text-xs text-text-muted">
                {t("danger.resetDesc")}
              </p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              data-testid="reset-progress-btn"
              onClick={() => setShowResetModal(true)}
            >
              {t("danger.resetButton")}
            </Button>
            {resetDone && (
              <p className="text-sm text-primary">{t("danger.resetDone")}</p>
            )}
          </div>

          {/* Delete account */}
          <div className="space-y-3 border-t border-border pt-6">
            <div>
              <h3 className="text-sm font-medium text-text">{t("danger.deleteAccount")}</h3>
              <p className="text-xs text-text-muted">
                {t("danger.deleteDesc")}
              </p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              data-testid="delete-account-btn"
              onClick={() => setShowDeleteModal(true)}
            >
              {t("danger.deleteButton")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reset confirmation modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-md rounded-xl bg-card p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-text mb-2">
              ⚠️ {t("danger.resetModalTitle")}
            </h3>
            <p className="text-sm text-text-muted mb-4">
              {t("danger.resetModalDesc")}
            </p>
            <p className="text-sm text-text-muted mb-4">
              {t("danger.resetConfirmPrompt")}
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
                {t("danger.cancel")}
              </Button>
              <Button
                variant="destructive"
                disabled={resetConfirm !== "REINICIAR" || resetting}
                onClick={handleReset}
              >
                {resetting ? t("danger.resetting") : t("danger.reset")}
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
              🗑️ {t("danger.deleteModalTitle")}
            </h3>
            <p className="text-sm text-text-muted mb-4">
              {t("danger.deleteModalDesc")}
            </p>
            <p className="text-sm text-text-muted mb-4">
              {t("danger.deleteConfirmPrompt")}
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
                {t("danger.cancel")}
              </Button>
              <Button
                variant="destructive"
                data-testid="confirm-delete-btn"
                disabled={!deleteConfirm.includes("@")}
                onClick={handleDelete}
              >
                {t("danger.deleteButton")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
