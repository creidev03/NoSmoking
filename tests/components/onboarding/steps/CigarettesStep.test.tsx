import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

vi.mock("next-intl", () => ({
  useTranslations: (namespace: string) => {
    const translations: Record<string, Record<string, string>> = {
      onboarding: {
        "cigarettes.question": "How many cigarettes do you smoke per day on average?",
      },
    };
    const ns = translations[namespace] || {};
    return (key: string) => ns[key] || `${namespace}.${key}`;
  },
}));

import { CigarettesStep } from "@/components/onboarding/steps/CigarettesStep";

describe("CigarettesStep", () => {
  it("renders the question using translations", () => {
    const onSubmit = vi.fn();
    render(<CigarettesStep onSubmit={onSubmit} />);
    expect(screen.getByText("How many cigarettes do you smoke per day on average?")).toBeInTheDocument();
  });

  it("renders all cigarette range buttons", () => {
    const onSubmit = vi.fn();
    render(<CigarettesStep onSubmit={onSubmit} />);
    expect(screen.getByRole("button", { name: "1-5" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "6-10" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "11-15" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "16-20" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "21-40" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "40+" })).toBeInTheDocument();
  });

  it("calls onSubmit with the correct value when a range is clicked", () => {
    const onSubmit = vi.fn();
    render(<CigarettesStep onSubmit={onSubmit} />);
    fireEvent.click(screen.getByRole("button", { name: "6-10" }));
    expect(onSubmit).toHaveBeenCalledWith(8);
  });

  it("calls onSubmit with different values for different ranges", () => {
    const onSubmit = vi.fn();
    render(<CigarettesStep onSubmit={onSubmit} />);
    fireEvent.click(screen.getByRole("button", { name: "1-5" }));
    expect(onSubmit).toHaveBeenCalledWith(3);
    fireEvent.click(screen.getByRole("button", { name: "40+" }));
    expect(onSubmit).toHaveBeenCalledWith(50);
  });

  it("disables buttons when disabled prop is true", () => {
    const onSubmit = vi.fn();
    render(<CigarettesStep onSubmit={onSubmit} disabled />);
    const buttons = screen.getAllByRole("button");
    buttons.forEach((button) => expect(button).toBeDisabled());
    fireEvent.click(screen.getByRole("button", { name: "1-5" }));
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
