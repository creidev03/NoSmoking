import { sqliteTable, text, integer, real, unique } from "drizzle-orm/sqlite-core";

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
  totalLives: real("total_lives").notNull(),
  remainingLives: real("remaining_lives").notNull(),
  cigarettesToday: integer("cigarettes_today").notNull().default(0),
  streakDays: integer("streak_days").notNull().default(0),
  lastCigaretteAt: text("last_cigarette_at"),
  lastActionAt: text("last_action_at"),
  nextActionAvailableAt: text("next_action_available_at"),
  status: text("status").notNull().default("active"),
  relapseStartedAt: text("relapse_started_at"),
  totalPoints: real("total_points").notNull().default(0),
  totalCigarettesAllTime: integer("total_cigarettes_all_time").notNull().default(0),
  consecutiveSmokingDays: integer("consecutive_smoking_days").notNull().default(0),
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

// @deprecated — replaced by achievements system (userAchievements table). Remove after 30 days.
export const badges = sqliteTable("badges", {
  id: text("id").primaryKey(),
  gameStateId: text("game_state_id")
    .notNull()
    .references(() => game_state.id),
  badgeKey: text("badge_key").notNull(),
  unlockedAt: text("unlocked_at").notNull(),
});

export const achievements = sqliteTable("achievements", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  icon: text("icon").notNull(),
  category: text("category").notNull(),
  difficulty: text("difficulty").notNull(),
  isSecret: integer("is_secret", { mode: "boolean" }).notNull().default(false),
  description: text("description").notNull(),
  conditionType: text("condition_type").notNull(),
  conditionValue: text("condition_value").notNull(),
  createdAt: text("created_at").notNull(),
});

export const userAchievements = sqliteTable(
  "user_achievements",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    achievementId: text("achievement_id")
      .notNull()
      .references(() => achievements.id),
    unlockedAt: text("unlocked_at").notNull(),
    createdAt: text("created_at").notNull(),
  },
  (t) => ({
    uniqueUserAchievement: unique().on(t.userId, t.achievementId),
  })
);

export const achievementProgress = sqliteTable(
  "achievement_progress",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    achievementId: text("achievement_id")
      .notNull()
      .references(() => achievements.id),
    currentValue: integer("current_value").notNull().default(0),
    lastUpdated: text("last_updated").notNull(),
  },
  (t) => ({
    uniqueAchievementProgress: unique().on(t.userId, t.achievementId),
  })
);

// --- Settings & Profile tables ---

export const userProfile = sqliteTable("user_profile", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => users.id),
  avatarUrl: text("avatar_url"),
  motivations: text("motivations"), // JSON array: ["salud", "dinero", "familia"]
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const preferences = sqliteTable("preferences", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => users.id),
  notificationsEnabled: integer("notifications_enabled", { mode: "boolean" }).notNull().default(true),
  reminderInterval: text("reminder_interval").notNull().default("6h"),
  language: text("language").notNull().default("es"),
  theme: text("theme").notNull().default("auto"),
  soundsEnabled: integer("sounds_enabled", { mode: "boolean" }).notNull().default(true),
  updatedAt: text("updated_at").notNull(),
});
