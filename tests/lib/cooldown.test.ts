import { describe, it, expect } from "vitest";
import {
  getPhase,
  getNextActionAvailableAt,
  isCooldownActive,
} from "@/lib/cooldown";

describe("cooldown", () => {
  describe("getPhase", () => {
    it("returns phase 1 for 45 minutes since last cigarette", () => {
      const lastCigaretteAt = new Date("2026-01-15T10:00:00Z");
      const now = new Date("2026-01-15T10:45:00Z");
      const result = getPhase(lastCigaretteAt, now);
      expect(result.phase).toBe(1);
      expect(result.cooldownMinutes).toBe(20);
    });

    it("returns phase 1 for 0 minutes (just smoked)", () => {
      const lastCigaretteAt = new Date("2026-01-15T10:00:00Z");
      const now = new Date("2026-01-15T10:00:00Z");
      const result = getPhase(lastCigaretteAt, now);
      expect(result.phase).toBe(1);
      expect(result.cooldownMinutes).toBe(20);
    });

    it("returns phase 1 for 119 minutes (just under 2h)", () => {
      const lastCigaretteAt = new Date("2026-01-15T10:00:00Z");
      const now = new Date("2026-01-15T11:59:00Z");
      const result = getPhase(lastCigaretteAt, now);
      expect(result.phase).toBe(1);
      expect(result.cooldownMinutes).toBe(20);
    });

    it("returns phase 2 for 2 hours since last cigarette", () => {
      const lastCigaretteAt = new Date("2026-01-15T10:00:00Z");
      const now = new Date("2026-01-15T12:00:00Z");
      const result = getPhase(lastCigaretteAt, now);
      expect(result.phase).toBe(2);
      expect(result.cooldownMinutes).toBe(15);
    });

    it("returns phase 2 for 7 hours 59 minutes", () => {
      const lastCigaretteAt = new Date("2026-01-15T10:00:00Z");
      const now = new Date("2026-01-15T17:59:00Z");
      const result = getPhase(lastCigaretteAt, now);
      expect(result.phase).toBe(2);
      expect(result.cooldownMinutes).toBe(15);
    });

    it("returns phase 3 for 8 hours since last cigarette", () => {
      const lastCigaretteAt = new Date("2026-01-15T10:00:00Z");
      const now = new Date("2026-01-15T18:00:00Z");
      const result = getPhase(lastCigaretteAt, now);
      expect(result.phase).toBe(3);
      expect(result.cooldownMinutes).toBe(45);
    });

    it("returns phase 3 for 23 hours 59 minutes", () => {
      const lastCigaretteAt = new Date("2026-01-15T10:00:00Z");
      const now = new Date("2026-01-16T09:59:00Z");
      const result = getPhase(lastCigaretteAt, now);
      expect(result.phase).toBe(3);
      expect(result.cooldownMinutes).toBe(45);
    });

    it("returns phase 4 for 24 hours since last cigarette", () => {
      const lastCigaretteAt = new Date("2026-01-15T10:00:00Z");
      const now = new Date("2026-01-16T10:00:00Z");
      const result = getPhase(lastCigaretteAt, now);
      expect(result.phase).toBe(4);
      expect(result.cooldownMinutes).toBe(60);
    });

    it("returns phase 4 for 48 hours", () => {
      const lastCigaretteAt = new Date("2026-01-15T10:00:00Z");
      const now = new Date("2026-01-17T10:00:00Z");
      const result = getPhase(lastCigaretteAt, now);
      expect(result.phase).toBe(4);
      expect(result.cooldownMinutes).toBe(60);
    });
  });

  describe("getNextActionAvailableAt", () => {
    it("returns lastActionAt + cooldown minutes", () => {
      const lastActionAt = new Date("2026-01-15T10:00:00Z");
      const result = getNextActionAvailableAt(lastActionAt, 20);
      expect(result).toBe("2026-01-15T10:20:00.000Z");
    });

    it("handles 15 minute cooldown", () => {
      const lastActionAt = new Date("2026-01-15T10:00:00Z");
      const result = getNextActionAvailableAt(lastActionAt, 15);
      expect(result).toBe("2026-01-15T10:15:00.000Z");
    });

    it("handles 60 minute cooldown", () => {
      const lastActionAt = new Date("2026-01-15T10:00:00Z");
      const result = getNextActionAvailableAt(lastActionAt, 60);
      expect(result).toBe("2026-01-15T11:00:00.000Z");
    });
  });

  describe("isCooldownActive", () => {
    it("returns true when nextActionAvailableAt is in the future", () => {
      const nextActionAvailableAt = new Date(
        Date.now() + 10 * 60 * 1000
      ).toISOString();
      expect(isCooldownActive(nextActionAvailableAt)).toBe(true);
    });

    it("returns false when nextActionAvailableAt is in the past", () => {
      const nextActionAvailableAt = new Date(
        Date.now() - 10 * 60 * 1000
      ).toISOString();
      expect(isCooldownActive(nextActionAvailableAt)).toBe(false);
    });

    it("returns false when nextActionAvailableAt is null", () => {
      expect(isCooldownActive(null)).toBe(false);
    });
  });
});
