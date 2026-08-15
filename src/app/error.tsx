"use client";

import { ErrorBoundary } from "@/components/ui/error-boundary";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorBoundary onReset={reset}>
      <div className="flex min-h-screen items-center justify-center bg-[#FFFFFF] dark:bg-[#111827]">
        <ErrorBoundary
          fallback={
            <div className="flex flex-col items-center justify-center rounded-xl border border-[#E5E7EB] bg-white p-8 text-center dark:border-[#374151] dark:bg-[#1F2937]">
              <div className="mb-4 text-4xl">😵</div>
              <h3 className="mb-2 text-lg font-semibold text-[#1F2937] dark:text-[#F3F4F6]">
                Algo salió mal
              </h3>
              <p className="mb-4 text-sm text-[#6B7280] dark:text-[#9CA3AF]">
                Ocurrió un error inesperado. Por favor intenta de nuevo.
              </p>
              <button
                onClick={reset}
                className="rounded-lg bg-[#10B981] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#059669]"
              >
                Intentar de nuevo
              </button>
            </div>
          }
        >
          {null}
        </ErrorBoundary>
      </div>
    </ErrorBoundary>
  );
}
