import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StepIndicator } from "@/components/onboarding/StepIndicator";

describe("StepIndicator", () => {
  it("renders 4 step dots", () => {
    render(<StepIndicator currentStep={1} totalSteps={4} />);
    const dots = screen.getAllByRole("listitem");
    expect(dots).toHaveLength(4);
  });

  it("marks step 1 as active when currentStep is 1", () => {
    render(<StepIndicator currentStep={1} totalSteps={4} />);
    const steps = screen.getAllByRole("listitem");
    expect(steps[0]).toHaveAttribute("aria-current", "step");
  });

  it("marks completed steps as done", () => {
    render(<StepIndicator currentStep={3} totalSteps={4} />);
    const steps = screen.getAllByRole("listitem");
    expect(steps[0].getAttribute("aria-label")).toContain("completed");
    expect(steps[1].getAttribute("aria-label")).toContain("completed");
    expect(steps[2]).toHaveAttribute("aria-current", "step");
    expect(steps[3]).not.toHaveAttribute("aria-current");
  });

  it("shows step numbers for non-completed steps", () => {
    render(<StepIndicator currentStep={2} totalSteps={4} />);
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
  });

  it("shows checkmark for completed steps", () => {
    render(<StepIndicator currentStep={3} totalSteps={4} />);
    const steps = screen.getAllByRole("listitem");
    expect(steps[0].textContent).toBe("✓");
    expect(steps[1].textContent).toBe("✓");
  });

  it("handles single step (step 1 of 1)", () => {
    render(<StepIndicator currentStep={1} totalSteps={1} />);
    const steps = screen.getAllByRole("listitem");
    expect(steps).toHaveLength(1);
    expect(steps[0]).toHaveAttribute("aria-current", "step");
  });

  it("handles all steps completed", () => {
    render(<StepIndicator currentStep={5} totalSteps={4} />);
    const steps = screen.getAllByRole("listitem");
    expect(steps[0].getAttribute("aria-label")).toContain("completed");
    expect(steps[1].getAttribute("aria-label")).toContain("completed");
    expect(steps[2].getAttribute("aria-label")).toContain("completed");
    expect(steps[3].getAttribute("aria-label")).toContain("completed");
  });
});
