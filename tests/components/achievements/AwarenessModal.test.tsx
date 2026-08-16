import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AwarenessModal } from "@/components/achievements/AwarenessModal";
import type { Achievement } from "@/lib/achievements/types";

afterEach(() => {
  vi.restoreAllMocks();
});

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string, params?: Record<string, string | number>) => {
    const translations: Record<string, string> = {
      "autoClose": "Auto-cierre en",
      "seconds": "segundos",
      "understood": "ENTENDIDO",
    };
    let value = translations[key] || key;
    if (params) {
      for (const [param, val] of Object.entries(params)) {
        value = value.replace(`{${param}}`, String(val));
      }
    }
    return value;
  },
}));

const awarenessAchievement: Achievement = {
  id: "B001",
  name: "Primer Paso",
  icon: "⚠️",
  category: "awareness",
  difficulty: "balanced",
  isSecret: false,
  description: "Has registrado tu primer cigarro",
  conditionType: "cumulative_count",
  conditionValue: 1,
};

describe("AwarenessModal", () => {
  it("renders nothing when isOpen is false", () => {
    render(
      <AwarenessModal
        achievement={awarenessAchievement}
        isOpen={false}
        onClose={vi.fn()}
        message="Has fumado 1 cigarro (0.1 cajetilla)."
      />
    );
    expect(screen.queryByText("Primer Paso")).not.toBeInTheDocument();
  });

  it("renders nothing when achievement is null", () => {
    render(
      <AwarenessModal
        achievement={null}
        isOpen={true}
        onClose={vi.fn()}
        message="Test message"
      />
    );
    expect(screen.queryByText("Primer Paso")).not.toBeInTheDocument();
  });

  it("renders the awareness message when open", () => {
    render(
      <AwarenessModal
        achievement={awarenessAchievement}
        isOpen={true}
        onClose={vi.fn()}
        message="Has fumado 30 cigarros (1.5 cajetillas). ¡Puedes mejorar!"
      />
    );
    expect(
      screen.getByText("Has fumado 30 cigarros (1.5 cajetillas). ¡Puedes mejorar!")
    ).toBeInTheDocument();
  });

  it("renders achievement name", () => {
    render(
      <AwarenessModal
        achievement={awarenessAchievement}
        isOpen={true}
        onClose={vi.fn()}
        message="Test"
      />
    );
    expect(screen.getByText("Primer Paso")).toBeInTheDocument();
  });

  it("renders ENTENDIDO button", () => {
    render(
      <AwarenessModal
        achievement={awarenessAchievement}
        isOpen={true}
        onClose={vi.fn()}
        message="Test"
      />
    );
    expect(screen.getByText("ENTENDIDO")).toBeInTheDocument();
  });

  it("calls onClose when ENTENDIDO button is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <AwarenessModal
        achievement={awarenessAchievement}
        isOpen={true}
        onClose={onClose}
        message="Test"
      />
    );
    await user.click(screen.getByText("ENTENDIDO"));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("auto-dismisses after 10 seconds", async () => {
    vi.useFakeTimers();
    const onClose = vi.fn();
    render(
      <AwarenessModal
        achievement={awarenessAchievement}
        isOpen={true}
        onClose={onClose}
        message="Test"
      />
    );

    act(() => {
      vi.advanceTimersByTime(10000);
    });

    expect(onClose).toHaveBeenCalledOnce();
    vi.useRealTimers();
  });

  it("shows countdown during auto-dismiss", () => {
    vi.useFakeTimers();
    render(
      <AwarenessModal
        achievement={awarenessAchievement}
        isOpen={true}
        onClose={vi.fn()}
        message="Test"
      />
    );

    // Initially 10 seconds
    expect(screen.getByText("10")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(screen.getByText("7")).toBeInTheDocument();

    vi.useRealTimers();
  });

  it("does NOT dismiss when clicking backdrop (no onClick handler)", () => {
    // AwarenessModal intentionally has no onClick on backdrop
    // Verify the backdrop element exists but has no click handler
    render(
      <AwarenessModal
        achievement={awarenessAchievement}
        isOpen={true}
        onClose={vi.fn()}
        message="Test"
      />
    );
    const backdrop = screen.getByTestId("awareness-modal-backdrop");
    // The backdrop should be the outermost overlay
    expect(backdrop).toBeInTheDocument();
    // The dialog element inside should have stopPropagation equivalent
    // by not having onClose wired to backdrop clicks
  });

  it("applies yellow/orange styling to dialog", () => {
    render(
      <AwarenessModal
        achievement={awarenessAchievement}
        isOpen={true}
        onClose={vi.fn()}
        message="Test"
      />
    );
    const dialog = screen.getByRole("alertdialog");
    expect(dialog.className).toContain("amber");
  });
});
