"use client";

import type { TimelineEvent } from "@/lib/timeline";
import { getRelativeDayLabel } from "@/lib/timeline";
import { TimelineItem } from "./TimelineItem";
import { format } from "date-fns";
import { es, enUS } from "date-fns/locale";
import { useLocale } from "next-intl";

interface TimelineGroupProps {
  dateKey: string;
  events: TimelineEvent[];
}

export function TimelineGroup({ dateKey, events }: TimelineGroupProps) {
  const locale = useLocale();
  const dateFnsLocale = locale === "en" ? enUS : es;
  const date = new Date(dateKey + "T12:00:00");
  const label = getRelativeDayLabel(date, locale);
  const fullDate = format(date, "d 'de' MMMM, yyyy", { locale: dateFnsLocale });

  return (
    <div className="mb-6">
      {/* Day header */}
      <div className="mb-2 flex items-center gap-2">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground">
          {label}
        </h3>
        <span className="text-xs text-muted-foreground">{fullDate}</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      {/* Events */}
      <div className="divide-y divide-border">
        {events.map((event) => (
          <TimelineItem key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
}
