"use client";

import { formatDistanceToNow } from "date-fns";
import { es, enUS } from "date-fns/locale";
import type { TimelineEvent } from "@/lib/timeline";
import { useLocale } from "next-intl";

const COLOR_MAP: Record<string, string> = {
  green: "bg-primary",
  red: "bg-danger",
  orange: "bg-warning",
  blue: "bg-info",
  gold: "bg-yellow-500",
};

interface TimelineItemProps {
  event: TimelineEvent;
}

export function TimelineItem({ event }: TimelineItemProps) {
  const locale = useLocale();
  const dotColor = COLOR_MAP[event.color] || "bg-muted-foreground";
  const relativeTime = formatDistanceToNow(event.timestamp, {
    addSuffix: true,
    locale: locale === "en" ? enUS : es,
  });

  return (
    <div className="flex items-start gap-3 py-3">
      {/* Colored dot */}
      <div className="mt-1 flex-shrink-0">
        <div className={`h-3 w-3 rounded-full ${dotColor}`} />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          <span className="text-lg leading-none">{event.icon}</span>
          <p className="text-sm text-foreground">{event.message}</p>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{relativeTime}</p>
      </div>
    </div>
  );
}
