import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TimelineItem } from "@/components/timeline/TimelineItem";
import type { TimelineEvent } from "@/lib/timeline";

describe("TimelineItem", () => {
  const baseEvent: TimelineEvent = {
    id: "test-1",
    userId: "u1",
    type: "cigarette",
    timestamp: new Date(),
    data: {},
    message: "Fumaste 1 cigarro(s). Total hoy: 3 de 5",
    icon: "🚬",
    color: "orange",
  };

  it("renders cigarette event correctly", () => {
    render(<TimelineItem event={baseEvent} />);
    expect(screen.getByText("🚬")).toBeInTheDocument();
    expect(screen.getByText(/Fumaste 1 cigarro/)).toBeInTheDocument();
  });

  it("renders positive action event correctly", () => {
    const event: TimelineEvent = {
      ...baseEvent,
      id: "test-2",
      type: "positive_action",
      icon: "🫁",
      color: "green",
      message: "Respiración guiada completada. +0.5 vidas recuperadas",
    };
    render(<TimelineItem event={event} />);
    expect(screen.getByText("🫁")).toBeInTheDocument();
    expect(screen.getByText(/Respiración guiada/)).toBeInTheDocument();
  });

  it("renders penalty event correctly", () => {
    const event: TimelineEvent = {
      ...baseEvent,
      id: "test-3",
      type: "penalty",
      icon: "⚠️",
      color: "red",
      message: "Perdiste 1 vida. Te quedan 1 de 4",
    };
    render(<TimelineItem event={event} />);
    expect(screen.getByText("⚠️")).toBeInTheDocument();
    expect(screen.getByText(/Perdiste 1 vida/)).toBeInTheDocument();
  });

  it("shows relative timestamp", () => {
    render(<TimelineItem event={baseEvent} />);
    // date-fns formatDistanceToNow produces text like "hace X minutos"
    const timeText = screen.getByText(/hace/);
    expect(timeText).toBeInTheDocument();
  });
});
