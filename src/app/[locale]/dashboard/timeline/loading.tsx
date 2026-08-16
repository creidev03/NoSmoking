export default function TimelineLoading() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-48 rounded bg-muted" />
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-9 w-24 rounded-full bg-muted" />
          ))}
        </div>
        <div className="space-y-6 mt-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="h-4 w-32 rounded bg-muted" />
              {Array.from({ length: 2 }).map((_, j) => (
                <div key={j} className="flex items-start gap-3">
                  <div className="mt-1 h-3 w-3 rounded-full bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-3/4 rounded bg-muted" />
                    <div className="h-3 w-1/4 rounded bg-muted" />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
