"use client";

import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

interface RelapseTipsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RelapseTips({ isOpen, onClose }: RelapseTipsProps) {
  const t = useTranslations("relapse");
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-surface p-6 shadow-lg dark:border-border dark:bg-surface">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-text dark:text-text">
            {t("tips.title")}
          </h2>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            data-testid="close-tips-button"
            aria-label={t("tips.closeLabel")}
          >
            ✕
          </Button>
        </div>

        <div className="space-y-6">
          {/* Section 1 */}
          <section>
            <h3 className="mb-2 text-lg font-semibold text-text dark:text-text">
              {t("tips.whyNormal")}
            </h3>
            <p className="text-sm leading-relaxed text-text-muted dark:text-text-muted">
              {t("tips.whyNormalDesc")}
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <h3 className="mb-2 text-lg font-semibold text-text dark:text-text">
              {t("tips.whatToDoAfter")}
            </h3>
            <ul className="space-y-2 text-sm text-text-muted dark:text-text-muted">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-success">✓</span>
                <span>{t("tips.stopNow")}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-success">✓</span>
                <span>{t("tips.drinkWater")}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-success">✓</span>
                <span>{t("tips.doPositiveAction")}</span>
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section>
            <h3 className="mb-2 text-lg font-semibold text-text dark:text-text">
              {t("tips.provenTools")}
            </h3>
            <ul className="space-y-2 text-sm text-text-muted dark:text-text-muted">
              <li className="flex items-start gap-2">
                <span className="text-accent-purple">🫁</span>
                <span>{t("tips.deepBreathing")}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent-purple">🧘</span>
                <span>{t("tips.meditation10")}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent-purple">🏃</span>
                <span>{t("tips.lightExercise")}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent-purple">📞</span>
                <span>{t("tips.callSomeone")}</span>
              </li>
            </ul>
          </section>
        </div>

        <div className="mt-6">
          <Button
            variant="outline"
            className="w-full"
            onClick={onClose}
            data-testid="close-tips-footer-button"
          >
            {t("tips.close")}
          </Button>
        </div>
      </div>
    </div>
  );
}
