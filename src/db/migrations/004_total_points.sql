-- Migration 004: Add total_points to game_state
-- puntos_totales (spec sections 7.1 / 10.1): banked "extra lives" earned from positive
-- actions once the user is already at totalLives, capped at 3.

ALTER TABLE game_state ADD COLUMN total_points REAL NOT NULL DEFAULT 0;
