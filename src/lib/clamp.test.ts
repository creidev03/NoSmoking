import { describe, it, expect } from "vitest";
import {
  clampCigarettesPerDay,
  clampSmokingYears,
  clampQuitAttempts,
} from "./clamp";

describe("clampCigarettesPerDay", () => {
  it("passes through valid value 10", () => {
    expect(clampCigarettesPerDay(10)).toBe(10);
  });

  it("passes through boundary value 100", () => {
    expect(clampCigarettesPerDay(100)).toBe(100);
  });

  it("clamps value above 100 to 100", () => {
    expect(clampCigarettesPerDay(150)).toBe(100);
  });

  it("clamps negative to 0", () => {
    expect(clampCigarettesPerDay(-5)).toBe(0);
  });

  it("passes through 0", () => {
    expect(clampCigarettesPerDay(0)).toBe(0);
  });
});

describe("clampSmokingYears", () => {
  it("passes through valid value 5", () => {
    expect(clampSmokingYears(5)).toBe(5);
  });

  it("passes through boundary value 60", () => {
    expect(clampSmokingYears(60)).toBe(60);
  });

  it("clamps value above 60 to 60", () => {
    expect(clampSmokingYears(80)).toBe(60);
  });

  it("clamps negative to 0", () => {
    expect(clampSmokingYears(-3)).toBe(0);
  });
});

describe("clampQuitAttempts", () => {
  it("passes through valid value 3", () => {
    expect(clampQuitAttempts(3)).toBe(3);
  });

  it("passes through boundary value 50", () => {
    expect(clampQuitAttempts(50)).toBe(50);
  });

  it("clamps value above 50 to 50", () => {
    expect(clampQuitAttempts(75)).toBe(50);
  });

  it("clamps negative to 0", () => {
    expect(clampQuitAttempts(-10)).toBe(0);
  });
});
