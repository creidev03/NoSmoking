import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { CooldownTimer } from "@/components/dashboard/CooldownTimer";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    // useTranslations("dashboard.cooldown") scopes the namespace,
    // so t("ready") receives just "ready", not "dashboard.cooldown.ready"
    const translations: Record<string, string> = {
      "nextAction": "⏱️ Próxima Acción",
      "ready": "¡Listo para la siguiente acción!",
      "active": "Cooldown activo",
      "phase1": "Ansiedad inicial",
      "phase2": "Inquietud máxima",
      "phase3": "Ansiedad disminuye",
      "phase4": "Recuperación completa",
    };
    return translations[key] || key;
  },
}));

describe("CooldownTimer", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows ready state when nextActionAt is null", () => {
    render(
      <CooldownTimer nextActionAt={null} phase={1} onExpired={vi.fn()} />
    );
    expect(screen.getByTestId("cooldown-status")).toHaveTextContent(
      "¡Listo para la siguiente acción!"
    );
  });

  it("shows countdown when nextActionAt is in the future", () => {
    const future = new Date(Date.now() + 120_000).toISOString(); // 2 min from now
    render(
      <CooldownTimer nextActionAt={future} phase={2} onExpired={vi.fn()} />
    );
    expect(screen.getByTestId("phase-label")).toHaveTextContent(
      "Inquietud máxima"
    );
    expect(screen.getByRole("timer")).toHaveTextContent("2:00");
  });

  it("counts down every second", () => {
    const future = new Date(Date.now() + 120_000).toISOString();
    render(
      <CooldownTimer nextActionAt={future} phase={1} onExpired={vi.fn()} />
    );

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(screen.getByRole("timer")).toHaveTextContent("1:57");
  });

  it("calls onExpired when countdown reaches zero", () => {
    const onExpired = vi.fn();
    const future = new Date(Date.now() + 2000).toISOString(); // 2 seconds

    render(
      <CooldownTimer nextActionAt={future} phase={1} onExpired={onExpired} />
    );

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(onExpired).toHaveBeenCalledTimes(1);
  });

  it("shows correct phase label for each phase", () => {
    const future = new Date(Date.now() + 60_000).toISOString();

    const { rerender } = render(
      <CooldownTimer nextActionAt={future} phase={1} onExpired={vi.fn()} />
    );
    expect(screen.getByTestId("phase-label")).toHaveTextContent(
      "Ansiedad inicial"
    );

    rerender(
      <CooldownTimer nextActionAt={future} phase={3} onExpired={vi.fn()} />
    );
    expect(screen.getByTestId("phase-label")).toHaveTextContent(
      "Ansiedad disminuye"
    );

    rerender(
      <CooldownTimer nextActionAt={future} phase={4} onExpired={vi.fn()} />
    );
    expect(screen.getByTestId("phase-label")).toHaveTextContent(
      "Recuperación completa"
    );
  });

  it("formats time with leading zero for seconds under 10", () => {
    const future = new Date(Date.now() + 65_000).toISOString(); // 1:05
    render(
      <CooldownTimer nextActionAt={future} phase={1} onExpired={vi.fn()} />
    );
    expect(screen.getByRole("timer")).toHaveTextContent("1:05");
  });

  it("shows ready state when nextActionAt is in the past", () => {
    const past = new Date(Date.now() - 1000).toISOString();
    render(
      <CooldownTimer nextActionAt={past} phase={1} onExpired={vi.fn()} />
    );
    expect(screen.getByTestId("cooldown-status")).toHaveTextContent(
      "¡Listo para la siguiente acción!"
    );
  });

  it("does not call onExpired again after initial expiration", () => {
    const onExpired = vi.fn();
    const future = new Date(Date.now() + 1000).toISOString();

    render(
      <CooldownTimer nextActionAt={future} phase={1} onExpired={onExpired} />
    );

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(onExpired).toHaveBeenCalledTimes(1);

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(onExpired).toHaveBeenCalledTimes(1);
  });
});
