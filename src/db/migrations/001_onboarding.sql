-- Migration 001: Create users and onboarding_responses tables

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS onboarding_responses (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE REFERENCES users(id),
  cigarettes_per_day INTEGER,
  smoking_years INTEGER,
  motivation TEXT,
  quit_attempts INTEGER,
  computed_lives INTEGER,
  computed_difficulty TEXT,
  notification_enabled INTEGER,
  completed_at TEXT,
  current_step INTEGER NOT NULL DEFAULT 1
);
