"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { users, onboardingResponses } from "@/db/schema";
import { eq } from "drizzle-orm";
import { computeLives } from "@/lib/lives";
import { computeDifficulty } from "@/lib/difficulty";
import { shouldEnableNotifications } from "@/lib/notifications";
import {
  clampCigarettesPerDay,
  clampSmokingYears,
  clampQuitAttempts,
} from "@/lib/clamp";
import { randomUUID } from "crypto";

const VALID_STEPS = [1, 2, 3, 4] as const;

function validateStep(step: number): asserts step is (typeof VALID_STEPS)[number] {
  if (!VALID_STEPS.includes(step as (typeof VALID_STEPS)[number])) {
    throw new Error("Invalid step");
  }
}

export async function submitStep(
  userId: string,
  step: number,
  data: FormData
): Promise<{ nextStep: number }> {
  validateStep(step);

  // Check or create user
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .get();

  if (!existingUser) {
    await db.insert(users).values({
      id: userId,
      email: `${userId}@placeholder.com`,
      createdAt: new Date().toISOString(),
    });
  }

  // Check or create onboarding response
  const existingResponse = await db
    .select()
    .from(onboardingResponses)
    .where(eq(onboardingResponses.userId, userId))
    .get();

  let responseId: string;

  if (!existingResponse) {
    const newResponse = await db
      .insert(onboardingResponses)
      .values({
        id: randomUUID(),
        userId,
        currentStep: step,
      })
      .returning()
      .get();
    responseId = newResponse.id;
  } else {
    responseId = existingResponse.id;
  }

  // Validate and save step data
  switch (step) {
    case 1: {
      const raw = data.get("cigarettes_per_day");
      if (raw === null || raw === undefined || raw === "") {
        throw new Error("cigarettes_per_day is required");
      }
      const num = Number(raw);
      if (isNaN(num)) {
        throw new Error("cigarettes_per_day must be a number");
      }
      const clamped = clampCigarettesPerDay(num);
      await db
        .update(onboardingResponses)
        .set({ cigarettesPerDay: clamped, currentStep: 2 })
        .where(eq(onboardingResponses.id, responseId));
      return { nextStep: 2 };
    }
    case 2: {
      const raw = data.get("smoking_years");
      if (raw === null || raw === undefined || raw === "") {
        throw new Error("smoking_years is required");
      }
      const num = Number(raw);
      if (isNaN(num)) {
        throw new Error("smoking_years must be a number");
      }
      const clamped = clampSmokingYears(num);
      await db
        .update(onboardingResponses)
        .set({ smokingYears: clamped, currentStep: 3 })
        .where(eq(onboardingResponses.id, responseId));
      return { nextStep: 3 };
    }
    case 3: {
      const raw = data.get("motivation");
      if (raw === null || raw === undefined || raw === "") {
        throw new Error("motivation is required");
      }
      const motivation = String(raw);
      await db
        .update(onboardingResponses)
        .set({ motivation, currentStep: 4 })
        .where(eq(onboardingResponses.id, responseId));
      return { nextStep: 4 };
    }
    case 4: {
      const raw = data.get("quit_attempts");
      if (raw === null || raw === undefined || raw === "") {
        throw new Error("quit_attempts is required");
      }
      const num = Number(raw);
      if (isNaN(num)) {
        throw new Error("quit_attempts must be a number");
      }
      const clamped = clampQuitAttempts(num);
      await db
        .update(onboardingResponses)
        .set({ quitAttempts: clamped, currentStep: 5 })
        .where(eq(onboardingResponses.id, responseId));
      return { nextStep: 5 };
    }
    default:
      throw new Error("Invalid step");
  }
}

export async function completeOnboarding(
  userId: string
): Promise<{ redirect: string }> {
  const response = await db
    .select()
    .from(onboardingResponses)
    .where(eq(onboardingResponses.userId, userId))
    .get();

  if (!response) {
    throw new Error("No onboarding record found");
  }

  const computedLives = computeLives(response.cigarettesPerDay ?? 0);
  const computedDifficulty = computeDifficulty(
    response.smokingYears ?? 0,
    response.quitAttempts ?? 0
  );
  const notificationEnabled = shouldEnableNotifications(
    response.motivation ?? ""
  );

  await db
    .update(onboardingResponses)
    .set({
      computedLives,
      computedDifficulty,
      notificationEnabled,
      completedAt: new Date().toISOString(),
    })
    .where(eq(onboardingResponses.userId, userId));

  redirect("/dashboard");
}
