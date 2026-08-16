import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function LogrosLoading() {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="mt-2 h-4 w-64 animate-pulse rounded bg-muted" />
      </div>

      {/* Filter tabs skeleton */}
      <div className="mb-6 flex gap-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="h-8 w-16 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-40 animate-pulse rounded-xl border border-border bg-surface-card"
          />
        ))}
      </div>
    </div>
  );
}
