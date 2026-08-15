"use client";

import { ErrorBoundary } from "@/components/ui/error-boundary";

export default function SettingsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorBoundary onReset={reset}>
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <ErrorBoundary
          fallback={
            <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card p-8 text-center">
              <div className="mb-4 text-4xl">⚙️</div>
              <h3 className="mb-2 text-lg font-semibold text-text">
                No pudimos cargar la configuración
              </h3>
              <p className="mb-4 text-sm text-text-muted">
                Algo inesperado ocurrió. Por favor intenta de nuevo.
              </p>
              <button
                onClick={reset}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
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
