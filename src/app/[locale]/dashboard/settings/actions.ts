"use server";

import { db } from "@/lib/db";
import { userProfile, preferences, game_state, events, userAchievements, achievementProgress } from "@/db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface UserProfile {
  id: string;
  userId: string;
  avatarUrl: string | null;
  motivations: string[] | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  id: string;
  userId: string;
  notificationsEnabled: boolean;
  reminderInterval: string;
  language: string;
  theme: string;
  soundsEnabled: boolean;
  updatedAt: string;
}

export interface PreferencesUpdate {
  notificationsEnabled?: boolean;
  reminderInterval?: string;
  language?: string;
  theme?: string;
  soundsEnabled?: boolean;
}

function mapProfile(row: any): UserProfile {
  return {
    id: row.id,
    userId: row.userId,
    avatarUrl: row.avatarUrl,
    motivations: row.motivations ? JSON.parse(row.motivations) : null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function mapPreferences(row: any): UserPreferences {
  return {
    id: row.id,
    userId: row.userId,
    notificationsEnabled: row.notificationsEnabled,
    reminderInterval: row.reminderInterval,
    language: row.language,
    theme: row.theme,
    soundsEnabled: row.soundsEnabled,
    updatedAt: row.updatedAt,
  };
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const row = await db
    .select()
    .from(userProfile)
    .where(eq(userProfile.userId, userId))
    .get();

  return row ? mapProfile(row) : null;
}

export async function getUserPreferences(userId: string): Promise<UserPreferences | null> {
  const row = await db
    .select()
    .from(preferences)
    .where(eq(preferences.userId, userId))
    .get();

  return row ? mapPreferences(row) : null;
}

export async function updateUserProfile(
  userId: string,
  data: { name?: string; motivations?: string[] }
): Promise<{ success: boolean }> {
  const now = new Date().toISOString();
  const existing = await db
    .select()
    .from(userProfile)
    .where(eq(userProfile.userId, userId))
    .get();

  if (existing) {
    await db
      .update(userProfile)
      .set({
        motivations: data.motivations ? JSON.stringify(data.motivations) : existing.motivations,
        updatedAt: now,
      })
      .where(eq(userProfile.userId, userId));
  } else {
    await db.insert(userProfile).values({
      id: randomUUID(),
      userId,
      motivations: data.motivations ? JSON.stringify(data.motivations) : null,
      createdAt: now,
      updatedAt: now,
    });
  }

  return { success: true };
}

export async function updateUserPreferences(
  userId: string,
  data: PreferencesUpdate
): Promise<{ success: boolean }> {
  const now = new Date().toISOString();
  const existing = await db
    .select()
    .from(preferences)
    .where(eq(preferences.userId, userId))
    .get();

  if (existing) {
    await db
      .update(preferences)
      .set({
        ...(data.notificationsEnabled !== undefined && { notificationsEnabled: data.notificationsEnabled }),
        ...(data.reminderInterval !== undefined && { reminderInterval: data.reminderInterval }),
        ...(data.language !== undefined && { language: data.language }),
        ...(data.theme !== undefined && { theme: data.theme }),
        ...(data.soundsEnabled !== undefined && { soundsEnabled: data.soundsEnabled }),
        updatedAt: now,
      })
      .where(eq(preferences.userId, userId));
  } else {
    await db.insert(preferences).values({
      id: randomUUID(),
      userId,
      notificationsEnabled: data.notificationsEnabled ?? true,
      reminderInterval: data.reminderInterval ?? "6h",
      language: data.language ?? "es",
      theme: data.theme ?? "auto",
      soundsEnabled: data.soundsEnabled ?? true,
      updatedAt: now,
    });
  }

  return { success: true };
}

export async function resetProgress(userId: string): Promise<{ success: boolean }> {
  const now = new Date().toISOString();

  // Delete events
  const gameState = await db
    .select()
    .from(game_state)
    .where(eq(game_state.userId, userId))
    .get();

  if (gameState) {
    await db.delete(events).where(eq(events.gameStateId, gameState.id));
    await db.delete(userAchievements).where(eq(userAchievements.userId, userId));
    await db.delete(achievementProgress).where(eq(achievementProgress.userId, userId));

    await db
      .update(game_state)
      .set({
        remainingLives: gameState.totalLives,
        cigarettesToday: 0,
        streakDays: 0,
        totalPoints: 0,
        lastCigaretteAt: null,
        lastActionAt: null,
        nextActionAvailableAt: null,
        status: "active",
        relapseStartedAt: null,
        updatedAt: now,
      })
      .where(eq(game_state.id, gameState.id));
  }

  return { success: true };
}

export async function downloadUserData(userId: string): Promise<{ data: string }> {
  const profile = await getUserProfile(userId);
  const prefs = await getUserPreferences(userId);
  const gameState = await db
    .select()
    .from(game_state)
    .where(eq(game_state.userId, userId))
    .get();
  const userEvents = gameState
    ? await db
        .select()
        .from(events)
        .where(eq(events.gameStateId, gameState.id))
        .all()
    : [];
  const achievements = await db
    .select()
    .from(userAchievements)
    .where(eq(userAchievements.userId, userId))
    .all();

  const exportData = {
    exportDate: new Date().toISOString(),
    userId,
    profile,
    preferences: prefs,
    gameState: gameState
      ? {
          totalLives: gameState.totalLives,
          remainingLives: gameState.remainingLives,
          streakDays: gameState.streakDays,
          totalPoints: gameState.totalPoints,
          status: gameState.status,
          createdAt: gameState.createdAt,
        }
      : null,
    events: userEvents.map((e) => ({
      type: e.type,
      detail: e.detail,
      createdAt: e.createdAt,
    })),
    achievements: achievements.map((a) => ({
      achievementId: a.achievementId,
      unlockedAt: a.unlockedAt,
    })),
  };

  return { data: JSON.stringify(exportData, null, 2) };
}
