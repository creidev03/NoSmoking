import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StepForm } from "@/components/onboarding/StepForm";

describe("StepForm", () => {
  it("renders CigarettesStep for step 1", () => {
    render(
      <StepForm currentStep={1} onSubmit={vi.fn()} isPending={false} />
    );
    expect(
      screen.getByText(/cuántos cigarrillos fumas/i)
    ).toBeInTheDocument();
  });

  it("renders YearsStep for step 2", () => {
    render(
      <StepForm currentStep={2} onSubmit={vi.fn()} isPending={false} />
    );
    expect(
      screen.getByText(/cuánto tiempo fumas/i)
    ).toBeInTheDocument();
  });

  it("renders MotivationStep for step 3", () => {
    render(
      <StepForm currentStep={3} onSubmit={vi.fn()} isPending={false} />
    );
    expect(
      screen.getByText(/qué te motiva/i)
    ).toBeInTheDocument();
  });

  it("renders AttemptsStep for step 4", () => {
    render(
      <StepForm currentStep={4} onSubmit={vi.fn()} isPending={false} />
    );
    expect(
      screen.getByText(/intentos previos/i)
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
