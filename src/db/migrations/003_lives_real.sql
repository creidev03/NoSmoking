-- Migration 003: Convert game_state lives columns to REAL
-- Positive actions recover fractional lives (breathing/meditation +0.5, music +0.25)

CREATE TABLE game_state_new (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE REFERENCES users(id),
  total_lives REAL NOT NULL,
  remaining_lives REAL NOT NULL,
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

INSERT INTO game_state_new
SELECT id, user_id, total_lives, remaining_lives, cigarettes_today, streak_days,
       last_cigarette_at, last_action_at, next_action_available_at, status,
       relapse_started_at, created_at, updated_at
FROM game_state;

DROP TABLE game_state;
ALTER TABLE game_state_new RENAME TO game_state;
