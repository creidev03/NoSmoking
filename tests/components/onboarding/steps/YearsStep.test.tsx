import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

vi.mock("next-intl", () => ({
  useTranslations: (namespace: string) => {
    const translations: Record<string, Record<string, string>> = {
      onboarding: {
        "years.question": "How long have you been smoking?",
        "years.under1Year": "< 1 year",
        "years.1to5Years": "1-5 years",
        "years.5to10Years": "5-10 years",
        "years.over10Years": "10+ years",
      },
    };
    const ns = translations[namespace] || {};
    return (key: string) => ns[key] || `${namespace}.${key}`;
  },
}));

import { YearsStep } from "@/components/onboarding/steps/YearsStep";

describe("YearsStep", () => {
  it("renders the question using translations", () => {
    const onSubmit = vi.fn();
    render(<YearsStep onSubmit={onSubmit} />);
    expect(screen.getByText("How long have you been smoking?")).toBeInTheDocument();
  });

  it("renders all year range buttons with translated labels", () => {
    const onSubmit = vi.fn();
    render(<YearsStep onSubmit={onSubmit} />);
    expect(screen.getByRole("button", { name: "< 1 year" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "1-5 years" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "5-10 years" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "10+ years" })).toBeInTheDocument();
  });

  it("calls onSubmit with the correct value when a range is clicked", () => {
    const onSubmit = vi.fn();
    render(<YearsStep onSubmit={onSubmit} />);
    fireEvent.click(screen.getByRole("button", { name: "1-5 years" }));
    expect(onSubmit).toHaveBeenCalledWith(3);
  });

  it("disables buttons when disabled prop is true", () => {
    const onSubmit = vi.fn();
    render(<YearsStep onSubmit={onSubmit} disabled />);
    const buttons = screen.getAllByRole("button");
    buttons.forEach((button) => expect(button).toBeDisabled());
    fireEvent.click(screen.getByRole("button", { name: "< 1 year" }));
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
