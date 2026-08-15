import { describe, it, expect } from "vitest";
import { ACHIEVEMENT_SEEDS, ACHIEVEMENT_COUNT } from "@/lib/achievements/seed";

describe("achievement seed data", () => {
  it("contains exactly 33 achievements", () => {
    expect(ACHIEVEMENT_SEEDS).toHaveLength(33);
    expect(ACHIEVEMENT_COUNT).toBe(33);
  });

  it("has all unique IDs", () => {
    const ids = ACHIEVEMENT_SEEDS.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every achievement has all required fields", () => {
    for (const a of ACHIEVEMENT_SEEDS) {
      expect(a.id).toBeTruthy();
      expect(a.name).toBeTruthy();
      expect(a.icon).toBeTruthy();
      expect(a.category).toBeTruthy();
      expect(a.difficulty).toBeTruthy();
      expect(typeof a.isSecret).toBe("boolean");
      expect(a.description).toBeTruthy();
      expect(a.conditionType).toBeTruthy();
      expect(a.conditionValue).toBeTruthy();
    }
  });

  it("all categories are valid", () => {
    const validCategories = [
      "time",
      "progress",
      "actions",
      "challenges",
      "collection",
      "awareness",
    ];
    for (const a of ACHIEVEMENT_SEEDS) {
      expect(validCategories).toContain(a.category);
    }
  });

  it("all difficulties are valid", () => {
    const validDifficulties = ["easy", "medium", "hard", "extreme"];
    for (const a of ACHIEVEMENT_SEEDS) {
      expect(validDifficulties).toContain(a.difficulty);
    }
  });

  it("has correct counts per category", () => {
    const counts = ACHIEVEMENT_SEEDS.reduce(
      (acc, a) => {
        acc[a.category] = (acc[a.category] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );
    expect(counts.time).toBe(8); // T001-T008
    expect(counts.progress).toBe(5); // P001-P005
    expect(counts.actions).toBe(5); // A001-A005
    expect(counts.challenges).toBe(3); // D001-D003
    expect(counts.collection).toBe(5); // C001-C005
    expect(counts.awareness).toBe(7); // B001-B007
  });

  it("secret achievements have isSecret true", () => {
    const secrets = ACHIEVEMENT_SEEDS.filter((a) => a.isSecret);
    expect(secrets.length).toBeGreaterThan(0);
    for (const s of secrets) {
      expect(s.isSecret).toBe(true);
    }
  });

  it("IDs follow expected prefix pattern", () => {
    const prefixes = new Set(ACHIEVEMENT_SEEDS.map((a) => a.id.charAt(0)));
    expect(prefixes).toEqual(new Set(["T", "P", "A", "D", "C", "B"]));
  });

  it("condition types are all valid", () => {
    const validTypes = [
      "streak_days",
      "total_actions",
      "specific_actions",
      "milestones",
      "time_based",
      "collection",
      "cumulative_count",
      "consecutive_days_bad",
      "consecutive_days_action",
    ];
    for (const a of ACHIEVEMENT_SEEDS) {
      expect(validTypes).toContain(a.conditionType);
    }
  });
});
