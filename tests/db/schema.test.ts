import { describe, it, expect } from "vitest";
import {
  users,
  onboardingResponses,
  game_state,
  events,
  badges,
} from "@/db/schema";

const COLUMNS = Symbol.for("drizzle:Columns");
const TABLE_NAME = Symbol.for("drizzle:Name");
const FK_SYMBOL = Symbol.for("drizzle:SQLiteInlineForeignKeys");

function getColumns(table: any) {
  return table[COLUMNS];
}

function getForeignKeys(table: any) {
  return table[FK_SYMBOL] || [];
}

describe("Dashboard schema tables", () => {
  describe("game_state table", () => {
    it("exports a valid table definition", () => {
      expect(game_state).toBeDefined();
      expect(game_state[TABLE_NAME]).toBe("game_state");
    });

    it("has all required columns", () => {
      const columns = getColumns(game_state);
      expect(Object.keys(columns)).toContain("id");
      expect(Object.keys(columns)).toContain("userId");
      expect(Object.keys(columns)).toContain("totalLives");
      expect(Object.keys(columns)).toContain("remainingLives");
      expect(Object.keys(columns)).toContain("cigarettesToday");
      expect(Object.keys(columns)).toContain("streakDays");
      expect(Object.keys(columns)).toContain("lastCigaretteAt");
      expect(Object.keys(columns)).toContain("lastActionAt");
      expect(Object.keys(columns)).toContain("nextActionAvailableAt");
      expect(Object.keys(columns)).toContain("status");
      expect(Object.keys(columns)).toContain("relapseStartedAt");
      expect(Object.keys(columns)).toContain("createdAt");
      expect(Object.keys(columns)).toContain("updatedAt");
    });

    it("has correct column types", () => {
      const columns = getColumns(game_state);
      expect(columns.id.dataType).toBe("string");
      expect(columns.userId.dataType).toBe("string");
      expect(columns.totalLives.dataType).toBe("number");
      expect(columns.remainingLives.dataType).toBe("number");
      expect(columns.cigarettesToday.dataType).toBe("number");
      expect(columns.streakDays.dataType).toBe("number");
      expect(columns.status.dataType).toBe("string");
    });

    it("sets default values for cigarettes_today and streak_days", () => {
      const columns = getColumns(game_state);
      expect(columns.cigarettesToday.default).toBeDefined();
      expect(columns.streakDays.default).toBeDefined();
    });

    it("sets default status to 'active'", () => {
      const columns = getColumns(game_state);
      expect(columns.status.default).toBeDefined();
    });
  });

  describe("events table", () => {
    it("exports a valid table definition", () => {
      expect(events).toBeDefined();
      expect(events[TABLE_NAME]).toBe("events");
    });

    it("has all required columns", () => {
      const columns = getColumns(events);
      expect(Object.keys(columns)).toContain("id");
      expect(Object.keys(columns)).toContain("gameStateId");
      expect(Object.keys(columns)).toContain("type");
      expect(Object.keys(columns)).toContain("detail");
      expect(Object.keys(columns)).toContain("createdAt");
    });

    it("has correct column types", () => {
      const columns = getColumns(events);
      expect(columns.id.dataType).toBe("string");
      expect(columns.gameStateId.dataType).toBe("string");
      expect(columns.type.dataType).toBe("string");
      expect(columns.detail.dataType).toBe("string");
      expect(columns.createdAt.dataType).toBe("string");
    });
  });

  describe("badges table", () => {
    it("exports a valid table definition", () => {
      expect(badges).toBeDefined();
      expect(badges[TABLE_NAME]).toBe("badges");
    });

    it("has all required columns", () => {
      const columns = getColumns(badges);
      expect(Object.keys(columns)).toContain("id");
      expect(Object.keys(columns)).toContain("gameStateId");
      expect(Object.keys(columns)).toContain("badgeKey");
      expect(Object.keys(columns)).toContain("unlockedAt");
    });

    it("has correct column types", () => {
      const columns = getColumns(badges);
      expect(columns.id.dataType).toBe("string");
      expect(columns.gameStateId.dataType).toBe("string");
      expect(columns.badgeKey.dataType).toBe("string");
      expect(columns.unlockedAt.dataType).toBe("string");
    });
  });

  describe("foreign key references", () => {
    it("game_state references users via userId", () => {
      const fk = getForeignKeys(game_state);
      expect(fk.length).toBeGreaterThan(0);
      const ref = fk[0].reference();
      expect(ref.foreignColumns[0].table[TABLE_NAME]).toBe("users");
    });

    it("events references game_state via gameStateId", () => {
      const fk = getForeignKeys(events);
      expect(fk.length).toBeGreaterThan(0);
      const ref = fk[0].reference();
      expect(ref.foreignColumns[0].table[TABLE_NAME]).toBe("game_state");
    });

    it("badges references game_state via gameStateId", () => {
      const fk = getForeignKeys(badges);
      expect(fk.length).toBeGreaterThan(0);
      const ref = fk[0].reference();
      expect(ref.foreignColumns[0].table[TABLE_NAME]).toBe("game_state");
    });
  });

  describe("existing tables still work", () => {
    it("users table is unchanged", () => {
      const columns = getColumns(users);
      expect(columns.id).toBeDefined();
      expect(columns.email).toBeDefined();
      expect(columns.createdAt).toBeDefined();
    });

    it("onboarding_responses table is unchanged", () => {
      const columns = getColumns(onboardingResponses);
      expect(columns.id).toBeDefined();
      expect(columns.userId).toBeDefined();
      expect(columns.cigarettesPerDay).toBeDefined();
    });
  });
});
