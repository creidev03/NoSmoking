import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function SettingsLoading() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="mb-6">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
      </div>
      <div className="space-y-4">
        <div className="h-10 w-full animate-pulse rounded bg-muted" />
        <div className="h-64 w-full animate-pulse rounded-xl bg-muted" />
      </div>
      <LoadingSpinner />
    </div>
  );
}
