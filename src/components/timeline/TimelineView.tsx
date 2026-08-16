"use client";

import { useState, useCallback } from "react";
import type { TimelineEvent, TimelineFilter } from "@/lib/timeline";
import { groupEventsByDay } from "@/lib/timeline";
import { getTimelineEvents } from "@/app/[locale]/dashboard/actions";
import { TimelineFilters } from "./TimelineFilters";
import { TimelineGroup } from "./TimelineGroup";
import { useTranslations, useLocale } from "next-intl";

interface TimelineViewProps {
  userId: string;
  initialEvents: TimelineEvent[];
  initialHasMore: boolean;
}

export function TimelineView({
  userId,
  initialEvents,
  initialHasMore,
}: TimelineViewProps) {
  const t = useTranslations("timeline");
  const locale = useLocale();
  const [activeFilter, setActiveFilter] = useState<TimelineFilter>("all");
  const [events, setEvents] = useState<TimelineEvent[]>(initialEvents);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);

  const timezoneOffset = new Date().getTimezoneOffset();

  const handleFilterChange = useCallback(
    async (filter: TimelineFilter) => {
      setActiveFilter(filter);
      setLoading(true);
      try {
        const result = await getTimelineEvents(userId, filter, 0, 20, locale, timezoneOffset);
        setEvents(result.events);
        setHasMore(result.hasMore);
        setPage(0);
      } finally {
        setLoading(false);
      }
    },
    [userId, locale, timezoneOffset]
  );

  const loadMore = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    try {
      const nextPage = page + 1;
      const result = await getTimelineEvents(userId, activeFilter, nextPage, 20, locale, timezoneOffset);
      setEvents((prev) => [...prev, ...result.events]);
      setHasMore(result.hasMore);
      setPage(nextPage);
    } finally {
      setLoading(false);
    }
  }, [userId, activeFilter, page, loading, locale, timezoneOffset]);

  const grouped = groupEventsByDay(events);

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold text-foreground">{t("title")}</h1>

      <TimelineFilters active={activeFilter} onChange={handleFilterChange} />

      <div className="mt-4">
        {loading && events.length === 0 && (
          /* Skeleton loading */
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse space-y-3">
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
        )}

        {!loading && events.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-lg text-muted-foreground">
              {t("empty")}
            </p>
          </div>
        )}

        {events.length > 0 && (
          <>
            {[...grouped.entries()].map(([dateKey, dayEvents]) => (
              <TimelineGroup key={dateKey} dateKey={dateKey} events={dayEvents} />
            ))}

            {hasMore && (
              <div className="flex justify-center py-4">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="rounded-full bg-muted px-6 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
                >
                  {loading ? t("loading") : t("loadMore")}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
