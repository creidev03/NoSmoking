import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { game_state } from "@/db/schema";
import { eq } from "drizzle-orm";
import { DashboardView } from "@/components/dashboard/DashboardView";
import { ACHIEVEMENT_SEEDS } from "@/lib/achievements/seed";
import type { Achievement } from "@/lib/achievements/types";
import { processMidnightReset } from "./actions";
import { setRequestLocale } from "next-intl/server";
import type { GameState } from "@/lib/game-state";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const { userId } = await auth();

  if (!userId) {
    redirect(`/${locale}/sign-in`);
  }

  const row = await db
    .select()
    .from(game_state)
    .where(eq(game_state.userId, userId))
    .get();

  if (!row) {
    redirect(`/${locale}/onboarding`);
  }

  // Process midnight reset: persists if needed + evaluates achievements
  // Wrap in try/catch — if this fails (DB timeout, auth issue), degrade gracefully
  // instead of crashing the entire Server Component render.
  let gameState: GameState = row as GameState;
  try {
    const reset = await processMidnightReset();
    gameState = reset.gameState;
  } catch (err) {
    // Log for monitoring but don't crash the page — use the gameState we already fetched
    console.error("processMidnightReset failed, using fallback gameState:", err);
  }

  const achievementSeeds = ACHIEVEMENT_SEEDS.map((seed) => ({
    ...seed,
    conditionValue: Number(seed.conditionValue),
  })) as Achievement[];

  return (
    <DashboardView
      gameState={gameState}
      achievements={achievementSeeds}
    />
  );
}
