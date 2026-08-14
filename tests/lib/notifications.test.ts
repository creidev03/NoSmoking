import { describe, it, expect } from "vitest";
import { shouldEnableNotifications } from "@/lib/notifications";

describe("shouldEnableNotifications", () => {
  it("returns true for health motivation", () => {
    expect(shouldEnableNotifications("health")).toBe(true);
  });

  it("returns true for family motivation", () => {
    expect(shouldEnableNotifications("family")).toBe(true);
  });

  it("returns true for money motivation", () => {
    expect(shouldEnableNotifications("money")).toBe(true);
  });

  it("returns true for appearance motivation", () => {
    expect(shouldEnableNotifications("appearance")).toBe(true);
  });

  it("returns false for other motivation", () => {
    expect(shouldEnableNotifications("other")).toBe(false);
  });

  it("returns false for empty string", () => {
    expect(shouldEnableNotifications("")).toBe(false);
  });

  it("returns false for unknown motivation", () => {
    expect(shouldEnableNotifications("unknown")).toBe(false);
  });

  it("returns false for case-sensitive mismatch", () => {
    expect(shouldEnableNotifications("Health")).toBe(false);
  });
});
