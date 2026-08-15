import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LivesDisplay } from "@/components/dashboard/LivesDisplay";

describe("LivesDisplay", () => {
  it("renders filled hearts for remaining lives", () => {
    render(<LivesDisplay total={2} remaining={2} />);
    const hearts = screen.getAllByRole("img", { name: /vida completa/i });
    expect(hearts).toHaveLength(2);
  });

  it("renders mixed filled and empty hearts", () => {
    render(<LivesDisplay total={2} remaining={1} />);
    const fullHearts = screen.getAllByRole("img", { name: /vida completa/i });
    const grayHearts = screen.getAllByRole("img", { name: /vida perdida/i });
    expect(fullHearts).toHaveLength(1);
    expect(grayHearts).toHaveLength(1);
  });

  it("renders all empty hearts when remaining is 0", () => {
    render(<LivesDisplay total={2} remaining={0} />);
    const grayHearts = screen.getAllByRole("img", { name: /vida perdida/i });
    expect(grayHearts).toHaveLength(2);
  });

  it("displays fractional lives", () => {
    render(<LivesDisplay total={4} remaining={3} />);
    const container = screen.getByTestId("lives-display");
    expect(container).toHaveTextContent("3");
    expect(container).toHaveTextContent("de 4 vidas");
  });

  it("displays 0 lives when remaining is 0", () => {
    render(<LivesDisplay total={2} remaining={0} />);
    const container = screen.getByTestId("lives-display");
    expect(container).toHaveTextContent("0");
    expect(container).toHaveTextContent("de 2 vidas");
  });

  it("displays half-heart when remaining is a half value", () => {
    // remaining=1.5 → 1 full + 1 half + 0 gray
    render(<LivesDisplay total={2} remaining={1.5} />);
    const fullHearts = screen.getAllByRole("img", { name: /vida completa/i });
    const halfHearts = screen.getAllByRole("img", { name: /vida a la mitad/i });
    expect(fullHearts).toHaveLength(1);
    expect(halfHearts).toHaveLength(1);
    const container = screen.getByTestId("lives-display");
    expect(container).toHaveTextContent("1.5");
    expect(container).toHaveTextContent("de 2 vidas");
  });

  it("displays full lives when all remaining", () => {
    render(<LivesDisplay total={2} remaining={2} />);
    const container = screen.getByTestId("lives-display");
    expect(container).toHaveTextContent("2");
    expect(container).toHaveTextContent("de 2 vidas");
  });

  it("handles single half-life remaining (half heart)", () => {
    // remaining=0.5 → 0 full + 1 half + 1 gray
    render(<LivesDisplay total={2} remaining={0.5} />);
    const halfHearts = screen.getAllByRole("img", { name: /vida a la mitad/i });
    const grayHearts = screen.getAllByRole("img", { name: /vida perdida/i });
    expect(halfHearts).toHaveLength(1);
    expect(grayHearts).toHaveLength(1);
  });

  it("handles total of 1 life", () => {
    render(<LivesDisplay total={1} remaining={1} />);
    const hearts = screen.getAllByRole("img");
    expect(hearts).toHaveLength(1);
    const container = screen.getByTestId("lives-display");
    expect(container).toHaveTextContent("1");
    expect(container).toHaveTextContent("de 1 vidas");
  });

  it("handles total of 1 life with 0 remaining", () => {
    render(<LivesDisplay total={1} remaining={0} />);
    const hearts = screen.getAllByRole("img");
    expect(hearts).toHaveLength(1);
    const container = screen.getByTestId("lives-display");
    expect(container).toHaveTextContent("0");
    expect(container).toHaveTextContent("de 1 vidas");
  });

  it("clamps display when remaining exceeds total (defensive)", () => {
    // total=2, remaining=2.5 (clamped to 2 full + 1 half)
    render(<LivesDisplay total={2} remaining={2.5} />);
    const fullHearts = screen.getAllByRole("img", { name: /vida completa/i });
    const halfHearts = screen.getAllByRole("img", { name: /vida a la mitad/i });
    expect(fullHearts).toHaveLength(2);
    expect(halfHearts).toHaveLength(1);
    const container = screen.getByTestId("lives-display");
    expect(container).toHaveTextContent("2.5");
    expect(container).toHaveTextContent("de 2 vidas");
  });
});
