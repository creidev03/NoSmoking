-- Migration 002: Create game_state, events, and badges tables for dashboard

CREATE TABLE IF NOT EXISTS game_state (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE REFERENCES users(id),
  total_lives INTEGER NOT NULL,
  remaining_lives INTEGER NOT NULL,
  cigarettes_today INTEGER NOT NULL DEFAULT 0,
  streak_days INTEGER NOT NULL DEFAULT 0,
  last_cigarette_at TEXT,
  last_action_at TEXT,
  next_action_available_at TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  relapse_started_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  game_state_id TEXT NOT NULL REFERENCES game_state(id),
  type TEXT NOT NULL,
  detail TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS badges (
  id TEXT PRIMARY KEY,
  game_state_id TEXT NOT NULL REFERENCES game_state(id),
  badge_key TEXT NOT NULL,
  unlocked_at TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS badges_game_state_id_badge_key_unique
  ON badges(game_state_id, badge_key);
