import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { game_state, badges } from "@/db/schema";
import { eq } from "drizzle-orm";
import { DashboardView } from "@/components/dashboard/DashboardView";
import { ACHIEVEMENT_SEEDS } from "@/lib/achievements/seed";
import { processMidnightReset } from "./actions";

export default async function DashboardPage() {
  const row = await db
    .select()
    .from(game_state)
    .where(eq(game_state.userId, "stub-user-id"))
    .get();

  if (!row) {
    redirect("/onboarding");
  }

  // Process midnight reset: persists if needed + evaluates achievements
  const { gameState, achievements } = await processMidnightReset(row.userId);

  const badgeRows = await db
    .select()
    .from(badges)
    .where(eq(badges.gameStateId, row.id))
    .all();

  const unlockedBadges = badgeRows.map((b) => ({
    key: b.badgeKey,
    unlockedAt: b.unlockedAt,
  }));

  const achievementSeeds = ACHIEVEMENT_SEEDS.map((seed) => ({
    ...seed,
    conditionValue: Number(seed.conditionValue),
  }));

  return (
    <DashboardView
      gameState={gameState}
      badges={unlockedBadges}
      achievements={achievementSeeds}
      userAchievements={achievements.userAchievements}
      progress={achievements.progress}
    />
  );
}
