import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { achievements, userAchievements, achievementProgress } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ACHIEVEMENT_SEEDS } from "@/lib/achievements/seed";
import type { Achievement } from "@/lib/achievements/types";
import { AchievementsView } from "@/components/achievements/AchievementsView";

export default async function LogrosPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Get all achievements from seed data
  const allAchievements = ACHIEVEMENT_SEEDS.map((seed) => ({
    ...seed,
    conditionValue: Number(seed.conditionValue),
  })) as Achievement[];

  // Get user's unlocked achievements
  const userAchievementRows = await db
    .select()
    .from(userAchievements)
    .where(eq(userAchievements.userId, userId))
    .all();

  // Get user's achievement progress
  const progressRows = await db
    .select()
    .from(achievementProgress)
    .where(eq(achievementProgress.userId, userId))
    .all();

  const userAchievementsData = userAchievementRows.map((row) => ({
    achievementId: row.achievementId,
    unlockedAt: row.unlockedAt,
  }));

  return (
    <div className="container mx-auto px-4 py-6">
      <AchievementsView
        achievements={allAchievements}
        userAchievements={userAchievementsData}
        userId={userId}
      />
    </div>
  );
}
