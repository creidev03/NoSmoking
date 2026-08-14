import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LivesDisplay } from "@/components/dashboard/LivesDisplay";

describe("LivesDisplay", () => {
  it("renders filled hearts for remaining lives", () => {
    render(<LivesDisplay total={4} remaining={4} />);
    const hearts = screen.getAllByRole("img", { name: /life/i });
    expect(hearts).toHaveLength(4);
  });

  it("renders mixed filled and empty hearts", () => {
    render(<LivesDisplay total={4} remaining={2} />);
    const hearts = screen.getAllByRole("img", { name: /life/i });
    expect(hearts).toHaveLength(4);
    expect(hearts[0]).toHaveTextContent("❤️");
    expect(hearts[1]).toHaveTextContent("❤️");
    expect(hearts[2]).toHaveTextContent("🤍");
    expect(hearts[3]).toHaveTextContent("🤍");
  });

  it("renders all empty hearts when remaining is 0", () => {
    render(<LivesDisplay total={4} remaining={0} />);
    const hearts = screen.getAllByRole("img", { name: /life/i });
    expect(hearts).toHaveLength(4);
    for (const heart of hearts) {
      expect(heart).toHaveTextContent("🤍");
    }
  });

  it("displays fractional lives (divides by 2)", () => {
    render(<LivesDisplay total={8} remaining={6} />);
    expect(screen.getByText("3 de 4 vidas")).toBeInTheDocument();
  });

  it("displays 0 lives when remaining is 0", () => {
    render(<LivesDisplay total={4} remaining={0} />);
    expect(screen.getByText("0 de 2 vidas")).toBeInTheDocument();
  });

  it("displays half-life when remaining is odd", () => {
    render(<LivesDisplay total={4} remaining={3} />);
    expect(screen.getByText("1.5 de 2 vidas")).toBeInTheDocument();
  });

  it("displays full lives when all remaining", () => {
    render(<LivesDisplay total={4} remaining={4} />);
    expect(screen.getByText("2 de 2 vidas")).toBeInTheDocument();
  });

  it("handles single life remaining", () => {
    render(<LivesDisplay total={4} remaining={1} />);
    const hearts = screen.getAllByRole("img", { name: /life/i });
    expect(hearts).toHaveLength(4);
    expect(hearts[0]).toHaveTextContent("❤️");
    expect(hearts[1]).toHaveTextContent("🤍");
  });

  it("handles total of 1 life", () => {
    render(<LivesDisplay total={1} remaining={1} />);
    const hearts = screen.getAllByRole("img", { name: /life/i });
    expect(hearts).toHaveLength(1);
    expect(hearts[0]).toHaveTextContent("❤️");
    expect(screen.getByText("0.5 de 0.5 vidas")).toBeInTheDocument();
  });

  it("handles total of 1 life with 0 remaining", () => {
    render(<LivesDisplay total={1} remaining={0} />);
    const hearts = screen.getAllByRole("img", { name: /life/i });
    expect(hearts).toHaveLength(1);
    expect(hearts[0]).toHaveTextContent("🤍");
    expect(screen.getByText("0 de 0.5 vidas")).toBeInTheDocument();
  });

  it("clamps display when remaining exceeds total (defensive)", () => {
    render(<LivesDisplay total={4} remaining={5} />);
    const hearts = screen.getAllByRole("img", { name: /life/i });
    expect(hearts).toHaveLength(4);
    for (const heart of hearts) {
      expect(heart).toHaveTextContent("❤️");
    }
    expect(screen.getByText("2.5 de 2 vidas")).toBeInTheDocument();
  });
});
