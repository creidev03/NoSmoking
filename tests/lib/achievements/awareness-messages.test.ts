import { describe, it, expect } from "vitest";
import { generateAwarenessMessage } from "@/lib/achievements/awareness-messages";

describe("generateAwarenessMessage", () => {
  it("returns a base message for 1 cigarette", () => {
    const msg = generateAwarenessMessage(1);
    expect(msg).toContain("1 cigarro");
    expect(msg).toContain("0.1 cajetilla");
    expect(msg).toBeDefined();
  });

  it("returns a message for 20 cigarettes (1 pack)", () => {
    const msg = generateAwarenessMessage(20);
    expect(msg).toContain("20 cigarros");
    expect(msg).toContain("1.0 cajetilla");
  });

  it("returns a message for 30 cigarettes", () => {
    const msg = generateAwarenessMessage(30);
    expect(msg).toContain("30 cigarros");
    expect(msg).toContain("1.5 cajetillas");
  });

  it("returns a message for 100 cigarettes", () => {
    const msg = generateAwarenessMessage(100);
    expect(msg).toContain("100 cigarros");
    expect(msg).toContain("5.0 cajetillas");
  });

  it("returns a message for 300 cigarettes", () => {
    const msg = generateAwarenessMessage(300);
    expect(msg).toContain("300 cigarros");
    expect(msg).toContain("15.0 cajetillas");
  });

  it("uses singular 'cajetilla' for exactly 1 pack", () => {
    const msg = generateAwarenessMessage(20);
    expect(msg).toContain("1.0 cajetilla");
    expect(msg).not.toContain("cajetillas");
  });

  it("uses plural 'cajetillas' for non-1 pack counts", () => {
    const msg = generateAwarenessMessage(40);
    expect(msg).toContain("2.0 cajetillas");
  });

  it("returns a string of reasonable length", () => {
    const msg = generateAwarenessMessage(50);
    expect(typeof msg).toBe("string");
    expect(msg.length).toBeGreaterThan(10);
  });
});
