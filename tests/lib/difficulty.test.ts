import { describe, it, expect } from "vitest";
import { computeDifficulty } from "@/lib/difficulty";

describe("computeDifficulty", () => {
  it("returns easy for 1 year and 0 attempts", () => {
    expect(computeDifficulty(1, 0)).toBe("easy");
  });

  it("returns easy for 0 years and 0 attempts", () => {
    expect(computeDifficulty(0, 0)).toBe("easy");
  });

  it("returns easy for 2 years and 0 attempts", () => {
    expect(computeDifficulty(2, 0)).toBe("easy");
  });

  it("returns medium for 3 years and 0 attempts", () => {
    expect(computeDifficulty(3, 0)).toBe("medium");
  });

  it("returns medium for 5 years and 2 attempts", () => {
    expect(computeDifficulty(5, 2)).toBe("medium");
  });

  it("returns medium for 1 year and 1 attempt", () => {
    expect(computeDifficulty(1, 1)).toBe("medium");
  });

  it("returns medium for 1 year and 3 attempts", () => {
    expect(computeDifficulty(1, 3)).toBe("medium");
  });

  it("returns hard for 15 years and 5 attempts", () => {
    expect(computeDifficulty(15, 5)).toBe("hard");
  });

  it("returns hard for 11 years and 0 attempts", () => {
    expect(computeDifficulty(11, 0)).toBe("hard");
  });

  it("returns hard for 1 year and 4 attempts", () => {
    expect(computeDifficulty(1, 4)).toBe("hard");
  });

  it("returns hard for 10 years and 4 attempts", () => {
    expect(computeDifficulty(10, 4)).toBe("hard");
  });

  it("returns medium for 10 years and 0 attempts", () => {
    expect(computeDifficulty(10, 0)).toBe("medium");
  });
});
