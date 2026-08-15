import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { RelapseCountdown } from "@/components/dashboard/RelapseCountdown";

describe("RelapseCountdown", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("displays countdown correctly", () => {
    const startedAt = new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(); // 10 hours ago
    const onExpired = vi.fn();

    render(<RelapseCountdown startedAt={startedAt} onExpired={onExpired} />);

    const display = screen.getByTestId("countdown-display");
    // Should show approximately 14 hours remaining
    expect(display).toHaveTextContent(/\d{2}:\d{2}:\d{2}/);
  });

  it("calls onExpired when countdown reaches zero", () => {
    // Start at 24h minus 1 second
    const startedAt = new Date(Date.now() - (24 * 60 * 60 - 1) * 1000).toISOString();
    const onExpired = vi.fn();

    render(<RelapseCountdown startedAt={startedAt} onExpired={onExpired} />);

    // Advance time by 2 seconds
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(onExpired).toHaveBeenCalled();
  });

  it("updates every second", () => {
    const startedAt = new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(); // 12 hours ago
    const onExpired = vi.fn();

    render(<RelapseCountdown startedAt={startedAt} onExpired={onExpired} />);

    const display1 = screen.getByTestId("countdown-display").textContent;

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    const display2 = screen.getByTestId("countdown-display").textContent;

    // Should have decremented by 1 second
    expect(display1).not.toBe(display2);
  });

  it("shows pulse animation when less than 1 hour remaining", () => {
    // Start at 23.5 hours ago (30 minutes remaining)
    const startedAt = new Date(Date.now() - 23.5 * 60 * 60 * 1000).toISOString();
    const onExpired = vi.fn();

    render(<RelapseCountdown startedAt={startedAt} onExpired={onExpired} />);

    const display = screen.getByTestId("countdown-display");
    expect(display.className).toContain("animate-pulse");
  });
});
