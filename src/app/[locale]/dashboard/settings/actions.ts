"use server";

import { db } from "@/lib/db";
import { userProfile, preferences, game_state, events, userAchievements, achievementProgress, users, onboardingResponses, feedback } from "@/db/schema";
import { eq } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";
import { randomUUID } from "crypto";
import { sendFeedbackEmail } from "@/lib/feedback";
import { requireAuth } from "@/lib/auth-guard";

export interface OnboardingData {
  id: string;
  userId: string;
  cigarettesPerDay: number | null;
  smokingYears: number | null;
  motivation: string | null;
  quitAttempts: number | null;
  notificationEnabled: boolean | null;
  completedAt: string | null;
}

export interface UserEmail {
  email: string | null;
}

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

export async function getUserProfile(): Promise<UserProfile | null> {
  const { userId } = await requireAuth();

  const row = await db
    .select()
    .from(userProfile)
    .where(eq(userProfile.userId, userId))
    .get();

  return row ? mapProfile(row) : null;
}

export async function getUserPreferences(): Promise<UserPreferences | null> {
  const { userId } = await requireAuth();

  const row = await db
    .select()
    .from(preferences)
    .where(eq(preferences.userId, userId))
    .get();

  return row ? mapPreferences(row) : null;
}

export async function updateUserProfile(
  data: { name?: string; motivations?: string[] }
): Promise<{ success: boolean }> {
  const { userId } = await requireAuth();

  const now = new Date().toISOString();
  await db.transaction(async (tx) => {
    await tx
      .insert(userProfile)
      .values({
        id: randomUUID(),
        userId,
        motivations: data.motivations ? JSON.stringify(data.motivations) : null,
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: userProfile.userId,
        set: {
          motivations: data.motivations ? JSON.stringify(data.motivations) : undefined,
          updatedAt: now,
        },
      });
  });

  return { success: true };
}

export async function updateUserPreferences(
  data: PreferencesUpdate
): Promise<{ success: boolean }> {
  const { userId } = await requireAuth();

  const now = new Date().toISOString();
  await db.transaction(async (tx) => {
    await tx
      .insert(preferences)
      .values({
        id: randomUUID(),
        userId,
        notificationsEnabled: data.notificationsEnabled ?? true,
        reminderInterval: data.reminderInterval ?? "6h",
        language: data.language ?? "es",
        theme: data.theme ?? "auto",
        soundsEnabled: data.soundsEnabled ?? true,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: preferences.userId,
        set: {
          ...(data.notificationsEnabled !== undefined && { notificationsEnabled: data.notificationsEnabled }),
          ...(data.reminderInterval !== undefined && { reminderInterval: data.reminderInterval }),
          ...(data.language !== undefined && { language: data.language }),
          ...(data.theme !== undefined && { theme: data.theme }),
          ...(data.soundsEnabled !== undefined && { soundsEnabled: data.soundsEnabled }),
          updatedAt: now,
        },
      });
  });

  return { success: true };
}

export async function resetProgress(): Promise<{ success: boolean }> {
  const { userId } = await requireAuth();

  const now = new Date().toISOString();

  await db.transaction(async (tx) => {
    // Delete events
    const gameState = await tx
      .select()
      .from(game_state)
      .where(eq(game_state.userId, userId))
      .get();

    if (gameState) {
      await tx.delete(events).where(eq(events.gameStateId, gameState.id));
      await tx.delete(userAchievements).where(eq(userAchievements.userId, userId));
      await tx.delete(achievementProgress).where(eq(achievementProgress.userId, userId));

      await tx
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
  });

  return { success: true };
}

export async function downloadUserData(): Promise<{ data: string }> {
  const { userId } = await requireAuth();

  // Batch 1: independent queries in parallel
  const [profile, prefs, gameState] = await Promise.all([
    getUserProfile(),
    getUserPreferences(),
    db
      .select()
      .from(game_state)
      .where(eq(game_state.userId, userId))
      .get(),
  ]);

  // Batch 2: dependent on gameState.id, run in parallel
  const [userEvents, achievements] = await Promise.all([
    gameState
      ? db
          .select()
          .from(events)
          .where(eq(events.gameStateId, gameState.id))
          .all()
      : [],
    db
      .select()
      .from(userAchievements)
      .where(eq(userAchievements.userId, userId))
      .all(),
  ]);

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

export async function getOnboardingResponses(): Promise<OnboardingData | null> {
  const { userId } = await requireAuth();

  const row = await db
    .select()
    .from(onboardingResponses)
    .where(eq(onboardingResponses.userId, userId))
    .get();

  if (!row) return null;

  return {
    id: row.id,
    userId: row.userId,
    cigarettesPerDay: row.cigarettesPerDay,
    smokingYears: row.smokingYears,
    motivation: row.motivation,
    quitAttempts: row.quitAttempts,
    notificationEnabled: row.notificationEnabled,
    completedAt: row.completedAt,
  };
}

export async function getUserEmail(): Promise<UserEmail> {
  const { userId } = await requireAuth();

  const row = await db
    .select({ email: users.email })
    .from(users)
    .where(eq(users.id, userId))
    .get();

  const storedEmail = row?.email;

  // If the stored email is missing or looks like a placeholder, fetch from Clerk
  if (!storedEmail || storedEmail.endsWith("@placeholder.com")) {
    const clerkUser = await currentUser();
    const realEmail = clerkUser?.emailAddresses?.[0]?.emailAddress ?? null;

    // Backfill the real email into the DB for future reads
    if (realEmail && storedEmail !== realEmail) {
      await db
        .update(users)
        .set({ email: realEmail })
        .where(eq(users.id, userId));
    }

    return { email: realEmail };
  }

  return { email: storedEmail };
}

export async function updateOnboardingMotivation(
  motivation: string
): Promise<{ success: boolean }> {
  const { userId } = await requireAuth();

  const now = new Date().toISOString();
  const existing = await db
    .select()
    .from(onboardingResponses)
    .where(eq(onboardingResponses.userId, userId))
    .get();

  if (existing) {
    await db
      .update(onboardingResponses)
      .set({ motivation })
      .where(eq(onboardingResponses.userId, userId));
  }

  return { success: true };
}

// --- Feedback ---

export async function submitFeedback(data: {
  type: "bug" | "improvement";
  subject: string;
  message: string;
}): Promise<{ success: boolean; error?: string }> {
  // Auth check
  let userId: string;
  try {
    const authResult = await requireAuth();
    userId = authResult.userId;
  } catch {
    return { success: false, error: "unauthorized" };
  }
  const user = await currentUser();
  if (!user) {
    return { success: false, error: "unauthorized" };
  }

  // Validation
  if (!data.subject || data.subject.trim().length === 0) {
    return { success: false, error: "subject_required" };
  }
  if (!data.message || data.message.trim().length === 0) {
    return { success: false, error: "message_required" };
  }
  if (data.subject.length > 200) {
    return { success: false, error: "subject_too_long" };
  }
  if (data.message.length > 2000) {
    return { success: false, error: "message_too_long" };
  }
  if (data.type !== "bug" && data.type !== "improvement") {
    return { success: false, error: "invalid_type" };
  }

  const now = new Date().toISOString();
  const feedbackId = randomUUID();

  // Insert feedback row
  await db.insert(feedback).values({
    id: feedbackId,
    userId,
    type: data.type,
    subject: data.subject,
    message: data.message,
    status: "pending",
    createdAt: now,
  });

  // Send email
  const emailResult = await sendFeedbackEmail({
    type: data.type,
    subject: data.subject,
    message: data.message,
    userEmail: user.emailAddresses?.[0]?.emailAddress ?? "",
    userId,
  });

  if (emailResult.success) {
    await db.update(feedback).set({ status: "sent", sentAt: now }).where(eq(feedback.id, feedbackId));
    return { success: true };
  } else {
    await db.update(feedback).set({ status: "failed" }).where(eq(feedback.id, feedbackId));
    return { success: false, error: emailResult.error };
  }
}
