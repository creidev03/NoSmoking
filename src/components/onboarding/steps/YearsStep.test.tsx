import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { YearsStep } from "@/components/onboarding/steps/YearsStep";

describe("YearsStep", () => {
  it("renders the question title", () => {
    render(<YearsStep onSubmit={vi.fn()} />);
    expect(
      screen.getByText(/cuánto tiempo fumas/i)
    ).toBeInTheDocument();
  });

  it("renders 4 year range buttons", () => {
    render(<YearsStep onSubmit={vi.fn()} />);
    expect(screen.getByRole("button", { name: /< 1 año/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /1-5 años/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /5-10 años/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /10\+ años/i })).toBeInTheDocument();
  });

  it("calls onSubmit with correct value for each range", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<YearsStep onSubmit={onSubmit} />);

    await user.click(screen.getByRole("button", { name: /< 1 año/i }));
    expect(onSubmit).toHaveBeenCalledWith(0);

    await user.click(screen.getByRole("button", { name: /1-5 años/i }));
    expect(onSubmit).toHaveBeenCalledWith(3);

    await user.click(screen.getByRole("button", { name: /5-10 años/i }));
    expect(onSubmit).toHaveBeenCalledWith(7);

    await user.click(screen.getByRole("button", { name: /10\+ años/i }));
    expect(onSubmit).toHaveBeenCalledWith(15);
  });
});
