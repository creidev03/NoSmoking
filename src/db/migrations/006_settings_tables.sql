-- Settings & Profile tables

-- User profile (extends users table)
CREATE TABLE IF NOT EXISTS user_profile (
  id TEXT PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  motivations TEXT, -- JSON array: ["salud", "dinero", "familia"]
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- User preferences
CREATE TABLE IF NOT EXISTS preferences (
  id TEXT PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL,
  notifications_enabled BOOLEAN DEFAULT TRUE,
  reminder_interval TEXT DEFAULT '6h',
  language TEXT DEFAULT 'es',
  theme TEXT DEFAULT 'auto',
  sounds_enabled BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
