import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

vi.mock("next-intl", () => ({
  useTranslations: (namespace: string) => {
    const translations: Record<string, Record<string, string>> = {
      onboarding: {
        "attempts.question": "How many previous attempts have you had?",
      },
    };
    const ns = translations[namespace] || {};
    return (key: string) => ns[key] || `${namespace}.${key}`;
  },
}));

import { AttemptsStep } from "@/components/onboarding/steps/AttemptsStep";

describe("AttemptsStep", () => {
  it("renders the question using translations", () => {
    const onSubmit = vi.fn();
    render(<AttemptsStep onSubmit={onSubmit} />);
    expect(screen.getByText("How many previous attempts have you had?")).toBeInTheDocument();
  });

  it("renders all attempt range buttons", () => {
    const onSubmit = vi.fn();
    render(<AttemptsStep onSubmit={onSubmit} />);
    expect(screen.getByRole("button", { name: "0" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "1-2" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "3-4" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "5+" })).toBeInTheDocument();
  });

  it("calls onSubmit with the correct value when a range is clicked", () => {
    const onSubmit = vi.fn();
    render(<AttemptsStep onSubmit={onSubmit} />);
    fireEvent.click(screen.getByRole("button", { name: "3-4" }));
    expect(onSubmit).toHaveBeenCalledWith(3);
  });

  it("disables buttons when disabled prop is true", () => {
    const onSubmit = vi.fn();
    render(<AttemptsStep onSubmit={onSubmit} disabled />);
    const buttons = screen.getAllByRole("button");
    buttons.forEach((button) => expect(button).toBeDisabled());
    fireEvent.click(screen.getByRole("button", { name: "0" }));
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
