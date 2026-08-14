import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CigarettesStep } from "@/components/onboarding/steps/CigarettesStep";

describe("CigarettesStep", () => {
  it("renders the question title", () => {
    render(<CigarettesStep onSubmit={vi.fn()} />);
    expect(
      screen.getByText(/cuántos cigarrillos fumas/i)
    ).toBeInTheDocument();
  });

  it("renders 6 cigarette range buttons", () => {
    render(<CigarettesStep onSubmit={vi.fn()} />);
    expect(screen.getByRole("button", { name: /1-5/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /6-10/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /11-15/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /16-20/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /21-40/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /40\+/i })).toBeInTheDocument();
  });

  it("calls onSubmit with correct value when a range is selected", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<CigarettesStep onSubmit={onSubmit} />);

    await user.click(screen.getByRole("button", { name: /6-10/i }));
    expect(onSubmit).toHaveBeenCalledWith(8);
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("maps each range to a midpoint value", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<CigarettesStep onSubmit={onSubmit} />);

    await user.click(screen.getByRole("button", { name: /1-5/i }));
    expect(onSubmit).toHaveBeenCalledWith(3);

    await user.click(screen.getByRole("button", { name: /40\+/i }));
    expect(onSubmit).toHaveBeenCalledWith(50);
  });
});
