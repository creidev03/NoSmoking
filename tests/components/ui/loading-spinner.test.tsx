import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

describe("LoadingSpinner", () => {
  it("renders with default classes", () => {
    const { container } = render(<LoadingSpinner />);
    const spinner = container.querySelector(".animate-pulse");
    expect(spinner).toBeTruthy();
  });

  it("accepts custom className", () => {
    const { container } = render(<LoadingSpinner className="h-32" />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain("h-32");
  });

  it("has min-h-[200px] by default", () => {
    const { container } = render(<LoadingSpinner />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain("min-h-[200px]");
  });
});
