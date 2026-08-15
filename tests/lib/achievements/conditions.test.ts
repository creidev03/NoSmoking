import { describe, it, expect } from "vitest";
import {
  checkStreakDays,
  checkTotalActions,
  checkMilestone,
  checkTimeRange,
  checkConsecutiveDaysAction,
  checkCollection,
  checkNoPenalties,
  checkPhaseActions,
} from "@/lib/achievements/conditions";

describe("conditions", () => {
  describe("checkStreakDays", () => {
    it("returns met when streak equals target", () => {
      const result = checkStreakDays(7, 7);
      expect(result.met).toBe(true);
      expect(result.progress).toBe(1);
    });

    it("returns met when streak exceeds target", () => {
      const result = checkStreakDays(14, 7);
      expect(result.met).toBe(true);
      expect(result.progress).toBe(1);
    });

    it("returns not met when streak is below target", () => {
      const result = checkStreakDays(3, 7);
      expect(result.met).toBe(false);
      expect(result.progress).toBeCloseTo(3 / 7);
    });

    it("returns not met for zero streak", () => {
      const result = checkStreakDays(0, 7);
      expect(result.met).toBe(false);
      expect(result.progress).toBe(0);
    });

    it("handles target of 1", () => {
      expect(checkStreakDays(1, 1).met).toBe(true);
      expect(checkStreakDays(0, 1).met).toBe(false);
    });
  });

  describe("checkTotalActions", () => {
    const events = [
      { type: "positive_action", createdAt: "2026-01-10T10:00:00Z" },
      { type: "positive_action", createdAt: "2026-01-11T10:00:00Z" },
      { type: "cigarette", createdAt: "2026-01-12T10:00:00Z" },
      { type: "positive_action", createdAt: "2026-01-13T10:00:00Z" },
    ];

    it("counts events matching actionType", () => {
      const result = checkTotalActions(events, "positive_action", 3);
      expect(result.met).toBe(true);
      expect(result.progress).toBe(1);
    });

    it("returns not met when count is below target", () => {
      const result = checkTotalActions(events, "positive_action", 5);
      expect(result.met).toBe(false);
      expect(result.progress).toBeCloseTo(3 / 5);
    });

    it("ignores events with different type", () => {
      const result = checkTotalActions(events, "cigarette", 2);
      expect(result.met).toBe(false);
      expect(result.progress).toBeCloseTo(1 / 2);
    });

    it("returns met when exactly at target", () => {
      const result = checkTotalActions(events, "positive_action", 3);
      expect(result.met).toBe(true);
    });

    it("returns zero progress for empty events", () => {
      const result = checkTotalActions([], "positive_action", 1);
      expect(result.met).toBe(false);
      expect(result.progress).toBe(0);
    });
  });

  describe("checkMilestone", () => {
    it("returns met when value equals target", () => {
      expect(checkMilestone(10, 10).met).toBe(true);
    });

    it("returns met when value exceeds target", () => {
      expect(checkMilestone(15, 10).met).toBe(true);
    });

    it("returns not met when value is below target", () => {
      const result = checkMilestone(5, 10);
      expect(result.met).toBe(false);
      expect(result.progress).toBeCloseTo(0.5);
    });

    it("returns met for 0 >= 0", () => {
      expect(checkMilestone(0, 0).met).toBe(true);
    });
  });

  describe("checkTimeRange", () => {
    it("returns met when hour is within range (no wrap)", () => {
      expect(checkTimeRange(10, 8, 18).met).toBe(true);
    });

    it("returns met at start boundary", () => {
      expect(checkTimeRange(8, 8, 18).met).toBe(true);
    });

    it("returns met at end boundary", () => {
      expect(checkTimeRange(18, 8, 18).met).toBe(true);
    });

    it("returns not met when hour is outside range", () => {
      expect(checkTimeRange(20, 8, 18).met).toBe(false);
    });

    it("returns met for midnight wrap range (22:00-06:00) at 23:00", () => {
      expect(checkTimeRange(23, 22, 6).met).toBe(true);
    });

    it("returns met for midnight wrap range at 02:00", () => {
      expect(checkTimeRange(2, 22, 6).met).toBe(true);
    });

    it("returns met for midnight wrap range at 06:00 (end boundary)", () => {
      expect(checkTimeRange(6, 22, 6).met).toBe(true);
    });

    it("returns not met for midnight wrap range at 12:00", () => {
      expect(checkTimeRange(12, 22, 6).met).toBe(false);
    });

    it("returns not met for midnight wrap range at 21:00", () => {
      expect(checkTimeRange(21, 22, 6).met).toBe(false);
    });

    it("returns progress 1.0 when met, 0.0 when not", () => {
      expect(checkTimeRange(10, 8, 18).progress).toBe(1);
      expect(checkTimeRange(20, 8, 18).progress).toBe(0);
    });
  });

  describe("checkConsecutiveDaysAction", () => {
    const today = new Date("2026-01-15T12:00:00Z");
    const events = [
      { type: "positive_action", createdAt: "2026-01-13T10:00:00Z" },
      { type: "positive_action", createdAt: "2026-01-14T10:00:00Z" },
      { type: "positive_action", createdAt: "2026-01-15T10:00:00Z" },
    ];

    it("returns met when actions on N consecutive days", () => {
      const result = checkConsecutiveDaysAction(events, "positive_action", 3, today);
      expect(result.met).toBe(true);
      expect(result.progress).toBe(1);
    });

    it("returns not met when fewer consecutive days", () => {
      const result = checkConsecutiveDaysAction(events, "positive_action", 5, today);
      expect(result.met).toBe(false);
      expect(result.progress).toBeCloseTo(3 / 5);
    });

    it("ignores events with different type", () => {
      const mixedEvents = [
        { type: "cigarette", createdAt: "2026-01-13T10:00:00Z" },
        { type: "positive_action", createdAt: "2026-01-14T10:00:00Z" },
        { type: "positive_action", createdAt: "2026-01-15T10:00:00Z" },
      ];
      const result = checkConsecutiveDaysAction(mixedEvents, "positive_action", 3, today);
      expect(result.met).toBe(false);
      expect(result.progress).toBeCloseTo(2 / 3);
    });

    it("returns not met for empty events", () => {
      const result = checkConsecutiveDaysAction([], "positive_action", 1, today);
      expect(result.met).toBe(false);
      expect(result.progress).toBe(0);
    });
  });

  describe("checkCollection", () => {
    it("returns met when all unlocked", () => {
      const result = checkCollection(8, 8);
      expect(result.met).toBe(true);
      expect(result.progress).toBe(1);
    });

    it("returns not met when partial", () => {
      const result = checkCollection(5, 8);
      expect(result.met).toBe(false);
      expect(result.progress).toBeCloseTo(5 / 8);
    });

    it("returns met for 0/0 (empty category)", () => {
      expect(checkCollection(0, 0).met).toBe(true);
    });
  });

  describe("checkNoPenalties", () => {
    const now = new Date("2026-01-15T12:00:00Z");

    it("returns met when no penalty events in last N days", () => {
      const events = [
        { type: "positive_action", createdAt: "2026-01-14T10:00:00Z" },
        { type: "milestone_reached", createdAt: "2026-01-13T10:00:00Z" },
      ];
      const result = checkNoPenalties(events, 7, now);
      expect(result.met).toBe(true);
      expect(result.progress).toBe(1);
    });

    it("returns not met when penalty events exist in window", () => {
      const events = [
        { type: "penalty", createdAt: "2026-01-14T10:00:00Z" },
      ];
      const result = checkNoPenalties(events, 7, now);
      expect(result.met).toBe(false);
      expect(result.progress).toBe(0);
    });

    it("returns met when penalty is outside the window", () => {
      const events = [
        { type: "penalty", createdAt: "2026-01-01T10:00:00Z" }, // 14 days ago
      ];
      const result = checkNoPenalties(events, 7, now);
      expect(result.met).toBe(true);
      expect(result.progress).toBe(1);
    });

    it("returns met for empty events", () => {
      const result = checkNoPenalties([], 7, now);
      expect(result.met).toBe(true);
    });
  });

  describe("checkPhaseActions", () => {
    const events = [
      { type: "action", detail: "cooldown:breathing", createdAt: "2026-01-10T10:00:00Z" },
      { type: "action", detail: "cooldown:breathing", createdAt: "2026-01-11T10:00:00Z" },
      { type: "action", detail: "cooldown:walking", createdAt: "2026-01-12T10:00:00Z" },
    ];

    it("counts actions matching phase in detail", () => {
      const result = checkPhaseActions(events, "cooldown:breathing", 2);
      expect(result.met).toBe(true);
      expect(result.progress).toBe(1);
    });

    it("returns not met when below target", () => {
      const result = checkPhaseActions(events, "cooldown:breathing", 5);
      expect(result.met).toBe(false);
      expect(result.progress).toBeCloseTo(2 / 5);
    });

    it("ignores non-matching phases", () => {
      const result = checkPhaseActions(events, "cooldown:walking", 2);
      expect(result.met).toBe(false);
      expect(result.progress).toBeCloseTo(1 / 2);
    });

    it("returns zero progress for empty events", () => {
      const result = checkPhaseActions([], "cooldown:breathing", 1);
      expect(result.met).toBe(false);
      expect(result.progress).toBe(0);
    });
  });
});
