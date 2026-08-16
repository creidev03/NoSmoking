"use client";

import { formatDistanceToNow } from "date-fns";
import { es, enUS } from "date-fns/locale";
import type { TimelineEvent } from "@/lib/timeline";
import { useLocale } from "next-intl";
import { Cigarette, Wind, Brain, Music, Sparkles, AlertTriangle, Circle, type LucideIcon } from "lucide-react";

const COLOR_MAP: Record<string, string> = {
  green: "bg-primary",
  red: "bg-danger",
  orange: "bg-warning",
  blue: "bg-info",
  gold: "bg-yellow-500",
};

const ICON_MAP: Record<string, LucideIcon> = {
  fumar: Cigarette,
  respiracion: Wind,
  meditacion: Brain,
  musica: Music,
  positive_action: Sparkles,
  penalty: AlertTriangle,
};

const ICON_LABELS: Record<string, string> = {
  fumar: "Cigarette event",
  respiracion: "Breathing exercise",
  meditacion: "Meditation session",
  musica: "Music relaxation",
  positive_action: "Positive action",
  penalty: "Penalty applied",
};

interface TimelineItemProps {
  event: TimelineEvent;
  isLast?: boolean;
}

export function TimelineItem({ event, isLast = false }: TimelineItemProps) {
  const locale = useLocale();
  const dotColor = COLOR_MAP[event.color] || "bg-muted-foreground";
  const relativeTime = formatDistanceToNow(event.timestamp, {
    addSuffix: true,
    locale: locale === "en" ? enUS : es,
  });

  const Icon = ICON_MAP[event.icon] ?? Circle;
  const iconLabel = ICON_LABELS[event.icon] ?? "Event";

  return (
    <div className="relative flex items-start gap-3 py-3">
      {/* Chain line — hidden for last item */}
      {!isLast && (
        <div
          aria-hidden="true"
          className="absolute left-[5px] top-4 h-full w-px bg-border"
        />
      )}

      {/* Colored dot */}
      <div className="relative z-10 mt-1 flex-shrink-0">
        <div className={`h-3 w-3 rounded-full ${dotColor}`} />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          <Icon size={16} className="mt-0.5 flex-shrink-0 text-muted-foreground" aria-label={iconLabel} role="img" />
          <p className="text-sm text-foreground">{event.message}</p>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{relativeTime}</p>
      </div>
    </div>
  );
}
