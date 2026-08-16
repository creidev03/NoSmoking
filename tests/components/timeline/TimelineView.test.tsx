import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { TimelineView } from "@/components/timeline/TimelineView";
import type { TimelineEvent } from "@/lib/timeline";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    // Handle both timeline.* and timeline.filters.* scoped keys
    const translations: Record<string, string> = {
      "title": "Línea de tiempo",
      "empty": "Aún no hay eventos. ¡Registra tu primer cigarro o actividad positiva!",
      "loading": "Cargando...",
      "loadMore": "Cargar más...",
      // TimelineFilters uses useTranslations("timeline.filters") so t("today") gets just "today"
      "today": "Hoy",
      "week": "Esta semana",
      "month": "Este mes",
      "all": "Todos",
    };
    return translations[key] || key;
  },
  useLocale: () => "es",
}));

// Mock server action
vi.mock("@/app/[locale]/dashboard/actions", () => ({
  getTimelineEvents: vi.fn(),
}));

import { getTimelineEvents } from "@/app/[locale]/dashboard/actions";
const mockGetTimelineEvents = vi.mocked(getTimelineEvents);

function makeEvent(id: string, hoursAgo = 0): TimelineEvent {
  const ts = new Date();
  ts.setHours(ts.getHours() - hoursAgo);
  return {
    id,
    userId: "u1",
    type: "cigarette",
    timestamp: ts,
    data: {},
    message: `Event ${id}`,
    icon: "fumar",
    color: "orange",
  };
}

describe("TimelineView", () => {
  const initialEvents = [makeEvent("e1", 1), makeEvent("e2", 2)];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders initial events", () => {
    render(
      <TimelineView
        initialEvents={initialEvents}
        initialHasMore={false}
      />
    );

    expect(screen.getByText(/Línea de tiempo/)).toBeInTheDocument();
    expect(screen.getByText("Event e1")).toBeInTheDocument();
    expect(screen.getByText("Event e2")).toBeInTheDocument();
  });

  it("renders filter tabs", () => {
    render(
      <TimelineView
        initialEvents={initialEvents}
        initialHasMore={false}
      />
    );

    expect(screen.getByText("Hoy")).toBeInTheDocument();
    expect(screen.getByText("Esta semana")).toBeInTheDocument();
    expect(screen.getByText("Este mes")).toBeInTheDocument();
    expect(screen.getByText("Todos")).toBeInTheDocument();
  });

  it("shows empty state when no events", () => {
    render(
      <TimelineView initialEvents={[]} initialHasMore={false} />
    );

    expect(
      screen.getByText(/Aún no hay eventos/)
    ).toBeInTheDocument();
  });

  it("switches filter and fetches new events", async () => {
    mockGetTimelineEvents.mockResolvedValue({
      events: [makeEvent("filtered-1")],
      hasMore: false,
      total: 1,
    });

    render(
      <TimelineView
        initialEvents={initialEvents}
        initialHasMore={false}
      />
    );

    fireEvent.click(screen.getByText("Hoy"));

    await waitFor(() => {
      expect(mockGetTimelineEvents).toHaveBeenCalledWith(
        "today", 0, 20,
        expect.any(String),
        expect.any(Number),
      );
    });

    await waitFor(() => {
      expect(screen.getByText("Event filtered-1")).toBeInTheDocument();
    });
  });

  it("loads more events on button click", async () => {
    mockGetTimelineEvents.mockResolvedValue({
      events: [makeEvent("more-1", 50)],
      hasMore: false,
      total: 3,
    });

    render(
      <TimelineView
        initialEvents={initialEvents}
        initialHasMore={true}
      />
    );

    fireEvent.click(screen.getByText("Cargar más..."));

    await waitFor(() => {
      expect(mockGetTimelineEvents).toHaveBeenCalledWith(
        "all", 1, 20,
        expect.any(String),
        expect.any(Number),
      );
    });

    await waitFor(() => {
      expect(screen.getByText("Event more-1")).toBeInTheDocument();
    });
  });
});
