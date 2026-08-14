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
