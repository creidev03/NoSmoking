"use client";

import { useTranslations } from "next-intl";

export default function TimelineError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("errors");

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="rounded-xl border border-border bg-surface-card p-8 text-center">
        <h2 className="mb-2 text-lg font-semibold text-foreground">
          {t("somethingWrong")}
        </h2>
        <p className="mb-4 text-sm text-muted-foreground">
          {error.message || t("timelineLoad")}
        </p>
        <button
          onClick={reset}
          className="rounded-full bg-primary px-6 py-2 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90"
        >
          {t("tryAgain")}
        </button>
      </div>
    </div>
  );
}
