import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { TimelineGroup } from "@/components/timeline/TimelineGroup";
import type { TimelineEvent } from "@/lib/timeline";

vi.mock("next-intl", () => ({
  useLocale: () => "es",
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      title: "Timeline",
      "relativeDay.today": "HOY",
      "relativeDay.yesterday": "AYER",
      "relativeDay.daysAgo": "HACE {count} DÍAS",
    };
    return translations[key] || key;
  },
}));

describe("TimelineGroup", () => {
  const createEvent = (id: string, icon: string = "fumar"): TimelineEvent => ({
    id,
    userId: "u1",
    type: "cigarette",
    timestamp: new Date(),
    data: {},
    message: `Event ${id}`,
    icon,
    color: "orange",
  });

  it("renders day header with date label", () => {
    const events = [createEvent("1")];
    const today = new Date();
    const dateKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    render(<TimelineGroup dateKey={dateKey} events={events} />);
    expect(screen.getByText("HOY")).toBeInTheDocument();
  });

  it("renders all events in the group", () => {
    const events = [
      createEvent("1"),
      createEvent("2"),
      createEvent("3"),
    ];
    render(<TimelineGroup dateKey="2026-01-15" events={events} />);
    expect(screen.getByText("Event 1")).toBeInTheDocument();
    expect(screen.getByText("Event 2")).toBeInTheDocument();
    expect(screen.getByText("Event 3")).toBeInTheDocument();
  });

  it("does not use divide-y separator", () => {
    const events = [createEvent("1"), createEvent("2")];
    const { container } = render(<TimelineGroup dateKey="2026-01-15" events={events} />);
    // The events container should not have divide-y class
    const eventsContainer = container.querySelector(".divide-y");
    expect(eventsContainer).toBeNull();
  });
});
