"use client";

import type { TimelineFilter } from "@/lib/timeline";

const FILTERS: { key: TimelineFilter; label: string }[] = [
  { key: "today", label: "Hoy" },
  { key: "week", label: "Esta semana" },
  { key: "month", label: "Este mes" },
  { key: "all", label: "Todos" },
];

interface TimelineFiltersProps {
  active: TimelineFilter;
  onChange: (filter: TimelineFilter) => void;
}

export function TimelineFilters({ active, onChange }: TimelineFiltersProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
      {FILTERS.map((f) => (
        <button
          key={f.key}
          onClick={() => onChange(f.key)}
          className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            active === f.key
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
