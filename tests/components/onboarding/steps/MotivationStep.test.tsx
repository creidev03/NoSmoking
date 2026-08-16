import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

vi.mock("next-intl", () => ({
  useTranslations: (namespace: string) => {
    const translations: Record<string, Record<string, string>> = {
      onboarding: {
        "motivation.question": "What motivates you to quit smoking?",
        "motivation.health": "Health",
        "motivation.family": "Family",
        "motivation.money": "Money",
        "motivation.appearance": "Appearance",
        "motivation.other": "Other",
      },
    };
    const ns = translations[namespace] || {};
    return (key: string) => ns[key] || `${namespace}.${key}`;
  },
}));

import { MotivationStep } from "@/components/onboarding/steps/MotivationStep";

describe("MotivationStep", () => {
  it("renders the question using translations", () => {
    const onSubmit = vi.fn();
    render(<MotivationStep onSubmit={onSubmit} />);
    expect(screen.getByText("What motivates you to quit smoking?")).toBeInTheDocument();
  });

  it("renders all motivation buttons with translated labels", () => {
    const onSubmit = vi.fn();
    render(<MotivationStep onSubmit={onSubmit} />);
    expect(screen.getByRole("button", { name: /Health/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Family/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Money/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Appearance/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Other/ })).toBeInTheDocument();
  });

  it("calls onSubmit with the correct value when a motivation is clicked", () => {
    const onSubmit = vi.fn();
    render(<MotivationStep onSubmit={onSubmit} />);
    fireEvent.click(screen.getByRole("button", { name: /Family/ }));
    expect(onSubmit).toHaveBeenCalledWith("family");
  });

  it("disables buttons when disabled prop is true", () => {
    const onSubmit = vi.fn();
    render(<MotivationStep onSubmit={onSubmit} disabled />);
    const buttons = screen.getAllByRole("button");
    buttons.forEach((button) => expect(button).toBeDisabled());
    fireEvent.click(screen.getByRole("button", { name: /Health/ }));
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
