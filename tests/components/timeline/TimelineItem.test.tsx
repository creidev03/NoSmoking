import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { TimelineItem } from "@/components/timeline/TimelineItem";
import type { TimelineEvent } from "@/lib/timeline";

vi.mock("next-intl", () => ({
  useLocale: () => "es",
}));

describe("TimelineItem", () => {
  const baseEvent: TimelineEvent = {
    id: "test-1",
    userId: "u1",
    type: "cigarette",
    timestamp: new Date(),
    data: {},
    message: "Fumaste 1 cigarro(s). Total hoy: 3 de 5",
    icon: "fumar",
    color: "orange",
  };

  it("renders cigarette event with Cigarette icon", () => {
    render(<TimelineItem event={baseEvent} />);
    expect(screen.getByRole("img", { name: "Cigarette event" })).toBeInTheDocument();
    expect(screen.getByText(/Fumaste 1 cigarro/)).toBeInTheDocument();
  });

  it("renders positive action event with Wind icon", () => {
    const event: TimelineEvent = {
      ...baseEvent,
      id: "test-2",
      type: "positive_action",
      icon: "respiracion",
      color: "green",
      message: "Respiración guiada completada. +0.5 vidas recuperadas",
    };
    render(<TimelineItem event={event} />);
    expect(screen.getByRole("img", { name: "Breathing exercise" })).toBeInTheDocument();
    expect(screen.getByText(/Respiración guiada/)).toBeInTheDocument();
  });

  it("renders penalty event with AlertTriangle icon", () => {
    const event: TimelineEvent = {
      ...baseEvent,
      id: "test-3",
      type: "penalty",
      icon: "penalty",
      color: "red",
      message: "Perdiste 1 vida. Te quedan 1 de 4",
    };
    render(<TimelineItem event={event} />);
    expect(screen.getByRole("img", { name: "Penalty applied" })).toBeInTheDocument();
    expect(screen.getByText(/Perdiste 1 vida/)).toBeInTheDocument();
  });

  it("renders meditation event with Brain icon", () => {
    const event: TimelineEvent = {
      ...baseEvent,
      id: "test-4",
      type: "positive_action",
      icon: "meditacion",
      color: "green",
      message: "Meditación completada",
    };
    render(<TimelineItem event={event} />);
    expect(screen.getByRole("img", { name: "Meditation session" })).toBeInTheDocument();
  });

  it("renders music event with Music icon", () => {
    const event: TimelineEvent = {
      ...baseEvent,
      id: "test-5",
      type: "positive_action",
      icon: "musica",
      color: "green",
      message: "Música de relajación completada",
    };
    render(<TimelineItem event={event} />);
    expect(screen.getByRole("img", { name: "Music relaxation" })).toBeInTheDocument();
  });

  it("renders Sparkles icon for positive_action events", () => {
    const event: TimelineEvent = {
      ...baseEvent,
      id: "test-sparkles",
      type: "positive_action",
      icon: "positive_action",
      color: "green",
      message: "Test positive",
    };
    render(<TimelineItem event={event} />);
    expect(screen.getByRole("img", { name: "Positive action" })).toBeInTheDocument();
  });

  it("renders icons at 16px size", () => {
    render(<TimelineItem event={baseEvent} />);
    const icon = screen.getByRole("img", { name: "Cigarette event" });
    expect(icon).toHaveAttribute("width", "16");
    expect(icon).toHaveAttribute("height", "16");
  });

  it("renders unknown icon key with Circle fallback", () => {
    const event: TimelineEvent = {
      ...baseEvent,
      id: "test-6",
      type: "positive_action",
      icon: "unknown_key",
      color: "green",
      message: "Some event",
    };
    render(<TimelineItem event={event} />);
    expect(screen.getByRole("img", { name: "Event" })).toBeInTheDocument();
  });

  it("shows chain line when isLast is false", () => {
    const { container } = render(<TimelineItem event={baseEvent} isLast={false} />);
    const chainLine = container.querySelector('[aria-hidden="true"].absolute');
    expect(chainLine).toBeInTheDocument();
    expect(chainLine).toHaveAttribute("aria-hidden", "true");
  });

  it("hides chain line when isLast is true", () => {
    const { container } = render(<TimelineItem event={baseEvent} isLast={true} />);
    const chainLine = container.querySelector('[aria-hidden="true"].absolute');
    expect(chainLine).not.toBeInTheDocument();
  });

  it("shows relative timestamp", () => {
    render(<TimelineItem event={baseEvent} />);
    // date-fns formatDistanceToNow produces text like "hace X minutos"
    const timeText = screen.getByText(/hace/);
    expect(timeText).toBeInTheDocument();
  });
});
