import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QuickActionsGrid } from "@/components/dashboard/QuickActionsGrid";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => {
    // useTranslations("dashboard.quickActions") scopes the namespace
    const translations: Record<string, string> = {
      "title": "⚡ Acciones rápidas",
      "cigarette": "Registrar Cigarro",
      "cigaretteDesc": "Registrar un cigarrillo fumado",
      "breathing": "Respiración Guiada",
      "breathingDesc": "Ejercicio de respiración calmante",
      "meditation": "Meditación",
      "meditationDesc": "Sesión de meditación breve",
      "music": "Música Premium",
      "musicDesc": "Escucha música relajante",
    };
    return translations[key] || key;
  },
}));

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

describe("QuickActionsGrid", () => {
  it("renders 4 action buttons", () => {
    render(<QuickActionsGrid userId="u-1" />);

    expect(screen.getByLabelText("Registrar Cigarro")).toBeInTheDocument();
    expect(screen.getByLabelText("Respiración Guiada")).toBeInTheDocument();
    expect(screen.getByLabelText("Meditación")).toBeInTheDocument();
    expect(screen.getByLabelText("Música Premium")).toBeInTheDocument();
  });

  it("calls onAction for breathing action", () => {
    const onAction = vi.fn();
    render(<QuickActionsGrid userId="u-1" onAction={onAction} />);

    const breathingButton = screen.getByLabelText("Respiración Guiada");
    fireEvent.click(breathingButton);

    expect(onAction).toHaveBeenCalledWith("breathing");
  });

  it("calls onAction for meditation action", () => {
    const onAction = vi.fn();
    render(<QuickActionsGrid userId="u-1" onAction={onAction} />);

    const meditationButton = screen.getByLabelText("Meditación");
    fireEvent.click(meditationButton);

    expect(onAction).toHaveBeenCalledWith("meditation");
  });

  it("disables breathing and meditation buttons when cooldown is active", () => {
    const onAction = vi.fn();
    render(
      <QuickActionsGrid
        userId="u-1"
        onAction={onAction}
        isCooldownActive={true}
      />
    );

    const breathingButton = screen.getByLabelText("Respiración Guiada");
    const meditationButton = screen.getByLabelText("Meditación");

    expect(breathingButton).toBeDisabled();
    expect(meditationButton).toBeDisabled();
  });
});
