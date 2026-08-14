import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AttemptsStep } from "@/components/onboarding/steps/AttemptsStep";

describe("AttemptsStep", () => {
  it("renders the question title", () => {
    render(<AttemptsStep onSubmit={vi.fn()} />);
    expect(
      screen.getByText(/intentos previos/i)
    ).toBeInTheDocument();
  });

  it("renders 4 attempt range buttons", () => {
    render(<AttemptsStep onSubmit={vi.fn()} />);
    expect(screen.getByRole("button", { name: /^0$/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /1-2/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /3-4/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /5\+/i })).toBeInTheDocument();
  });

  it("calls onSubmit with correct midpoint value", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<AttemptsStep onSubmit={onSubmit} />);

    await user.click(screen.getByRole("button", { name: /^0$/ }));
    expect(onSubmit).toHaveBeenCalledWith(0);

    await user.click(screen.getByRole("button", { name: /1-2/i }));
    expect(onSubmit).toHaveBeenCalledWith(1);

    await user.click(screen.getByRole("button", { name: /3-4/i }));
    expect(onSubmit).toHaveBeenCalledWith(3);

    await user.click(screen.getByRole("button", { name: /5\+/i }));
    expect(onSubmit).toHaveBeenCalledWith(5);
  });
});
