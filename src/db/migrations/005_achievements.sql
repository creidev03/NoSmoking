-- Migration 005: Add achievements system tables
-- Three new tables for comprehensive 33-achievement gamification layer.

-- 1. achievements: seed data table for achievement definitions
CREATE TABLE IF NOT EXISTS achievements (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  category TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  is_secret INTEGER NOT NULL DEFAULT 0,
  description TEXT NOT NULL,
  condition_type TEXT NOT NULL,
  condition_value TEXT NOT NULL,
  created_at TEXT NOT NULL
);

-- 2. user_achievements: unlock tracking per user
CREATE TABLE IF NOT EXISTS user_achievements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL REFERENCES users(id),
  achievement_id TEXT NOT NULL REFERENCES achievements(id),
  unlocked_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE(user_id, achievement_id)
);

-- 3. achievement_progress: progress tracking per user per achievement
CREATE TABLE IF NOT EXISTS achievement_progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL REFERENCES users(id),
  achievement_id TEXT NOT NULL REFERENCES achievements(id),
  current_value INTEGER NOT NULL DEFAULT 0,
  last_updated TEXT NOT NULL,
  UNIQUE(user_id, achievement_id)
);

-- 4. Add new columns to game_state for achievement evaluation
ALTER TABLE game_state ADD COLUMN total_cigarettes_all_time INTEGER NOT NULL DEFAULT 0;
ALTER TABLE game_state ADD COLUMN consecutive_smoking_days INTEGER NOT NULL DEFAULT 0;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement_id ON user_achievements(achievement_id);
CREATE INDEX IF NOT EXISTS idx_achievement_progress_user_id ON achievement_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_achievement_progress_achievement_id ON achievement_progress(achievement_id);
CREATE INDEX IF NOT EXISTS idx_achievements_category ON achievements(category);
