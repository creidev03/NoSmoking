"use client";

import { ErrorBoundary } from "@/components/ui/error-boundary";
import { useTranslations } from "next-intl";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("errors");

  return (
    <ErrorBoundary onReset={reset}>
      <div className="min-h-screen bg-[#FFFFFF] dark:bg-[#111827]">
        <div className="mx-auto max-w-2xl px-4 py-6">
          <ErrorBoundary
            fallback={
              <div className="flex flex-col items-center justify-center rounded-xl border border-[#E5E7EB] bg-white p-8 text-center dark:border-[#374151] dark:bg-[#1F2937]">
                <div className="mb-4 text-4xl">💔</div>
                <h3 className="mb-2 text-lg font-semibold text-[#1F2937] dark:text-[#F3F4F6]">
                  {t("dashboardLoad")}
                </h3>
                <p className="mb-4 text-sm text-[#6B7280] dark:text-[#9CA3AF]">
                  {error.message.includes("network") || error.message.includes("fetch")
                    ? t("networkError")
                    : error.message.includes("database") || error.message.includes("turso")
                      ? t("databaseError")
                      : t("unexpectedError")}
                </p>
                <button
                  onClick={reset}
                  className="rounded-lg bg-[#10B981] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#059669]"
                >
                  {t("tryAgain")}
                </button>
              </div>
            }
          >
            {null}
          </ErrorBoundary>
        </div>
      </div>
    </ErrorBoundary>
  );
}
