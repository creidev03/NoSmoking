import { describe, it, expect } from "vitest";
import { computeLives } from "@/lib/lives";

describe("computeLives", () => {
  it("returns 1 for 0 cigarettes per day", () => {
    expect(computeLives(0)).toBe(1);
  });

  it("returns 1 for 5 cigarettes per day", () => {
    expect(computeLives(5)).toBe(1);
  });

  it("returns 2 for 10 cigarettes per day", () => {
    expect(computeLives(10)).toBe(2);
  });

  it("returns 5 for 25 cigarettes per day", () => {
    expect(computeLives(25)).toBe(5);
  });

  it("returns 10 for 50 cigarettes per day", () => {
    expect(computeLives(50)).toBe(10);
  });

  it("caps at 10 for 60 cigarettes per day", () => {
    expect(computeLives(60)).toBe(10);
  });

  it("caps at 10 for 100 cigarettes per day (max input)", () => {
    expect(computeLives(100)).toBe(10);
  });

  it("returns minimum 1 for 1 cigarette per day", () => {
    expect(computeLives(1)).toBe(1);
  });

  it("returns 3 for 15 cigarettes per day", () => {
    expect(computeLives(15)).toBe(3);
  });

  it("returns 2 for 6 cigarettes per day (ceil, not floor)", () => {
    expect(computeLives(6)).toBe(2);
  });

  it("returns 4 for 20 cigarettes per day (1 caja)", () => {
    expect(computeLives(20)).toBe(4);
  });

  it("returns 8 for 40 cigarettes per day (2 cajas)", () => {
    expect(computeLives(40)).toBe(8);
  });
});
