import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";
import * as actions from "@/app/onboarding/actions";

vi.mock("@/app/onboarding/actions", () => ({
  submitStep: vi.fn(),
  completeOnboarding: vi.fn(),
}));

describe("OnboardingWizard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it("renders step 1 by default", () => {
    render(<OnboardingWizard initialStep={1} />);
    expect(
      screen.getByText(/cuántos cigarrillos fumas/i)
    ).toBeInTheDocument();
  });

  it("renders step indicator with 4 steps", () => {
    render(<OnboardingWizard initialStep={1} />);
    const steps = screen.getAllByRole("listitem");
    expect(steps).toHaveLength(4);
  });

  it("renders step 2 when initialStep is 2", () => {
    render(<OnboardingWizard initialStep={2} />);
    expect(
      screen.getByText(/cuánto tiempo fumas/i)
    ).toBeInTheDocument();
  });

  it("renders step 3 when initialStep is 3", () => {
    render(<OnboardingWizard initialStep={3} />);
    expect(
      screen.getByText(/qué te motiva/i)
    ).toBeInTheDocument();
  });

  it("renders step 4 when initialStep is 4", () => {
    render(<OnboardingWizard initialStep={4} />);
    expect(
      screen.getByText(/intentos previos/i)
    ).toBeInTheDocument();
  });

  it("shows glassmorphism card styling", () => {
    render(<OnboardingWizard initialStep={1} />);
    const nav = screen.getByRole("navigation");
    const card = nav.closest("div");
    expect(card).toHaveClass("backdrop-blur");
  });

  it("shows error message when server action fails", async () => {
    const user = userEvent.setup();
    vi.mocked(actions.submitStep).mockRejectedValue(
      new Error("Network error")
    );

    render(<OnboardingWizard initialStep={1} />);
    await user.click(screen.getByRole("button", { name: /6-10/i }));

    expect(
      await screen.findByRole("alert")
    ).toHaveTextContent("Network error");
  });

  it("allows retry after error", async () => {
    const user = userEvent.setup();
    vi.mocked(actions.submitStep)
      .mockRejectedValueOnce(new Error("Network error"))
      .mockResolvedValueOnce({ nextStep: 2 });

    render(<OnboardingWizard initialStep={1} />);
    await user.click(screen.getByRole("button", { name: /6-10/i }));

    // Error should appear
    expect(await screen.findByRole("alert")).toBeInTheDocument();

    // Retry
    await user.click(screen.getByRole("button", { name: /6-10/i }));
    expect(actions.submitStep).toHaveBeenCalledTimes(2);
  });

  it("clears error on next submission", async () => {
    const user = userEvent.setup();
    vi.mocked(actions.submitStep)
      .mockRejectedValueOnce(new Error("Network error"))
      .mockResolvedValueOnce({ nextStep: 2 });

    render(<OnboardingWizard initialStep={1} />);
    await user.click(screen.getByRole("button", { name: /6-10/i }));

    // Error appears
    expect(await screen.findByRole("alert")).toBeInTheDocument();

    // Click again — error should clear
    await user.click(screen.getByRole("button", { name: /6-10/i }));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
