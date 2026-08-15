import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { RelapseProgress } from "@/components/dashboard/RelapseProgress";

describe("RelapseProgress", () => {
  it("shows correct progress at 0%", () => {
    render(
      <RelapseProgress currentLives={0} targetLives={1} totalLives={7} />
    );

    const blocks = screen.getByTestId("progress-blocks");
    expect(blocks).toHaveTextContent("0/7");
    expect(blocks).toHaveTextContent("(1 más)");
  });

  it("shows correct progress at 50%", () => {
    render(
      <RelapseProgress currentLives={3} targetLives={6} totalLives={7} />
    );

    const blocks = screen.getByTestId("progress-blocks");
    expect(blocks).toHaveTextContent("3/7");
    expect(blocks).toHaveTextContent("(3 más)");
  });

  it("shows correct progress at 100%", () => {
    render(
      <RelapseProgress currentLives={5} targetLives={5} totalLives={7} />
    );

    const blocks = screen.getByTestId("progress-blocks");
    expect(blocks).toHaveTextContent("5/7");
    // Should not show "más" when target is met
    expect(blocks).not.toHaveTextContent("más");
  });

  it("renders correct number of blocks", () => {
    render(
      <RelapseProgress currentLives={2} targetLives={1} totalLives={5} />
    );

    // Should have 5 blocks total
    for (let i = 0; i < 5; i++) {
      expect(screen.getByTestId(`life-block-${i}`)).toBeInTheDocument();
    }
  });
});
