import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").unique(),
  createdAt: text("created_at").notNull(),
});

export const onboardingResponses = sqliteTable("onboarding_responses", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => users.id),
  cigarettesPerDay: integer("cigarettes_per_day"),
  smokingYears: integer("smoking_years"),
  motivation: text("motivation"),
  quitAttempts: integer("quit_attempts"),
  computedLives: integer("computed_lives"),
  computedDifficulty: text("computed_difficulty"),
  notificationEnabled: integer("notification_enabled", { mode: "boolean" }),
  completedAt: text("completed_at"),
  currentStep: integer("current_step").notNull().default(1),
});

export const game_state = sqliteTable("game_state", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => users.id),
  totalLives: integer("total_lives").notNull(),
  remainingLives: integer("remaining_lives").notNull(),
  cigarettesToday: integer("cigarettes_today").notNull().default(0),
  streakDays: integer("streak_days").notNull().default(0),
  lastCigaretteAt: text("last_cigarette_at"),
  lastActionAt: text("last_action_at"),
  nextActionAvailableAt: text("next_action_available_at"),
  status: text("status").notNull().default("active"),
  relapseStartedAt: text("relapse_started_at"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const events = sqliteTable("events", {
  id: text("id").primaryKey(),
  gameStateId: text("game_state_id")
    .notNull()
    .references(() => game_state.id),
  type: text("type").notNull(),
  detail: text("detail"),
  createdAt: text("created_at").notNull(),
});

export const badges = sqliteTable("badges", {
  id: text("id").primaryKey(),
  gameStateId: text("game_state_id")
    .notNull()
    .references(() => game_state.id),
  badgeKey: text("badge_key").notNull(),
  unlockedAt: text("unlocked_at").notNull(),
});
