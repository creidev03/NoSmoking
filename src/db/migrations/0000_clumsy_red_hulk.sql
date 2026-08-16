-- Order matters: create tables without FKs first, then tables that depend on them.

CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint

CREATE TABLE `achievements` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`icon` text NOT NULL,
	`category` text NOT NULL,
	`difficulty` text NOT NULL,
	`is_secret` integer DEFAULT false NOT NULL,
	`description` text NOT NULL,
	`condition_type` text NOT NULL,
	`condition_value` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint

CREATE TABLE `game_state` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`total_lives` real NOT NULL,
	`remaining_lives` real NOT NULL,
	`cigarettes_today` integer DEFAULT 0 NOT NULL,
	`streak_days` integer DEFAULT 0 NOT NULL,
	`last_cigarette_at` text,
	`last_action_at` text,
	`next_action_available_at` text,
	`status` text DEFAULT 'active' NOT NULL,
	`relapse_started_at` text,
	`total_points` real DEFAULT 0 NOT NULL,
	`total_cigarettes_all_time` integer DEFAULT 0 NOT NULL,
	`consecutive_smoking_days` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint

CREATE TABLE `achievement_progress` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`achievement_id` text NOT NULL,
	`current_value` integer DEFAULT 0 NOT NULL,
	`last_updated` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`achievement_id`) REFERENCES `achievements`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint

CREATE TABLE `badges` (
	`id` text PRIMARY KEY NOT NULL,
	`game_state_id` text NOT NULL,
	`badge_key` text NOT NULL,
	`unlocked_at` text NOT NULL,
	FOREIGN KEY (`game_state_id`) REFERENCES `game_state`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint

CREATE TABLE `events` (
	`id` text PRIMARY KEY NOT NULL,
	`game_state_id` text NOT NULL,
	`type` text NOT NULL,
	`detail` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`game_state_id`) REFERENCES `game_state`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint

CREATE TABLE `feedback` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`type` text NOT NULL,
	`subject` text NOT NULL,
	`message` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`sent_at` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint

CREATE TABLE `onboarding_responses` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`cigarettes_per_day` integer,
	`smoking_years` integer,
	`motivation` text,
	`quit_attempts` integer,
	`computed_lives` integer,
	`computed_difficulty` text,
	`notification_enabled` integer,
	`completed_at` text,
	`current_step` integer DEFAULT 1 NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint

CREATE TABLE `preferences` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`notifications_enabled` integer DEFAULT true NOT NULL,
	`reminder_interval` text DEFAULT '6h' NOT NULL,
	`language` text DEFAULT 'es' NOT NULL,
	`theme` text DEFAULT 'auto' NOT NULL,
	`sounds_enabled` integer DEFAULT true NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint

CREATE TABLE `user_achievements` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`achievement_id` text NOT NULL,
	`unlocked_at` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`achievement_id`) REFERENCES `achievements`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint

CREATE TABLE `user_profile` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`avatar_url` text,
	`motivations` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint

-- Indexes
CREATE UNIQUE INDEX `achievement_progress_user_id_achievement_id_unique` ON `achievement_progress` (`user_id`,`achievement_id`);
--> statement-breakpoint
CREATE INDEX `idx_badges_game` ON `badges` (`game_state_id`);
--> statement-breakpoint
CREATE INDEX `idx_events_game_created` ON `events` (`game_state_id`,`created_at`);
--> statement-breakpoint
CREATE UNIQUE INDEX `game_state_user_id_unique` ON `game_state` (`user_id`);
--> statement-breakpoint
CREATE UNIQUE INDEX `onboarding_responses_user_id_unique` ON `onboarding_responses` (`user_id`);
--> statement-breakpoint
CREATE UNIQUE INDEX `preferences_user_id_unique` ON `preferences` (`user_id`);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_achievements_user_id_achievement_id_unique` ON `user_achievements` (`user_id`,`achievement_id`);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_profile_user_id_unique` ON `user_profile` (`user_id`);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);
