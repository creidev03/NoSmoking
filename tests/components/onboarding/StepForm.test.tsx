import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StepForm } from "@/components/onboarding/StepForm";

vi.mock("next-intl", () => ({
  useTranslations: (namespace: string) => {
    const translations: Record<string, Record<string, string>> = {
      onboarding: {
        "cigarettes.question": "¿Cuántos cigarrillos fumas al día en promedio?",
        "years.question": "¿Hace cuánto tiempo fumas?",
        "years.under1Year": "< 1 año",
        "years.1to5Years": "1-5 años",
        "years.5to10Years": "5-10 años",
        "years.over10Years": "10+ años",
        "motivation.question": "¿Qué te motiva a dejar de fumar?",
        "motivation.health": "Salud",
        "motivation.family": "Familia",
        "motivation.money": "Dinero",
        "motivation.appearance": "Apariencia",
        "motivation.other": "Otro",
        "attempts.question": "¿Cuántos intentos previos has tenido?",
      },
    };
    const ns = translations[namespace] || {};
    return (key: string) => ns[key] || `${namespace}.${key}`;
  },
}));

describe("StepForm", () => {
  it("renders CigarettesStep for step 1", () => {
    render(
      <StepForm currentStep={1} onSubmit={vi.fn()} isPending={false} />
    );
    expect(
      screen.getByText("¿Cuántos cigarrillos fumas al día en promedio?")
    ).toBeInTheDocument();
  });

  it("renders YearsStep for step 2", () => {
    render(
      <StepForm currentStep={2} onSubmit={vi.fn()} isPending={false} />
    );
    expect(
      screen.getByText("¿Hace cuánto tiempo fumas?")
    ).toBeInTheDocument();
  });

  it("renders MotivationStep for step 3", () => {
    render(
      <StepForm currentStep={3} onSubmit={vi.fn()} isPending={false} />
    );
    expect(
      screen.getByText("¿Qué te motiva a dejar de fumar?")
    ).toBeInTheDocument();
  });

  it("renders AttemptsStep for step 4", () => {
    render(
      <StepForm currentStep={4} onSubmit={vi.fn()} isPending={false} />
    );
    expect(
      screen.getByText("¿Cuántos intentos previos has tenido?")
    ).toBeInTheDocument();
  });

  it("calls onSubmit with FormData when step submits", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<StepForm currentStep={1} onSubmit={onSubmit} isPending={false} />);

    await user.click(screen.getByRole("button", { name: /6-10/i }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
    const formData = onSubmit.mock.calls[0][0] as FormData;
    expect(formData.get("cigarettes_per_day")).toBe("8");
  });

  it("disables buttons when isPending", () => {
    render(
      <StepForm currentStep={1} onSubmit={vi.fn()} isPending={true} />
    );
    const buttons = screen.getAllByRole("button");
    buttons.forEach((button) => {
      expect(button).toBeDisabled();
    });
  });
});
