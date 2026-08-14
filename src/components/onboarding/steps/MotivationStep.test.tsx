import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MotivationStep } from "@/components/onboarding/steps/MotivationStep";

describe("MotivationStep", () => {
  it("renders the question title", () => {
    render(<MotivationStep onSubmit={vi.fn()} />);
    expect(
      screen.getByText(/qué te motiva/i)
    ).toBeInTheDocument();
  });

  it("renders 5 motivation buttons", () => {
    render(<MotivationStep onSubmit={vi.fn()} />);
    expect(screen.getByRole("button", { name: /salud/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /familia/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /dinero/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /apariencia/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /otro/i })).toBeInTheDocument();
  });

  it("calls onSubmit with correct motivation value", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<MotivationStep onSubmit={onSubmit} />);

    await user.click(screen.getByRole("button", { name: /salud/i }));
    expect(onSubmit).toHaveBeenCalledWith("health");
  });

  it("maps all motivations correctly", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<MotivationStep onSubmit={onSubmit} />);

    await user.click(screen.getByRole("button", { name: /familia/i }));
    expect(onSubmit).toHaveBeenCalledWith("family");

    await user.click(screen.getByRole("button", { name: /dinero/i }));
    expect(onSubmit).toHaveBeenCalledWith("money");

    await user.click(screen.getByRole("button", { name: /apariencia/i }));
    expect(onSubmit).toHaveBeenCalledWith("appearance");

    await user.click(screen.getByRole("button", { name: /otro/i }));
    expect(onSubmit).toHaveBeenCalledWith("other");
  });
});
