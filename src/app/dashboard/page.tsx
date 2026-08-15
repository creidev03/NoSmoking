import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { game_state, badges } from "@/db/schema";
import { eq } from "drizzle-orm";
import { checkMidnightReset } from "@/lib/game-state";
import { DashboardView } from "@/components/dashboard/DashboardView";

export default async function DashboardPage() {
  const row = await db
    .select()
    .from(game_state)
    .where(eq(game_state.userId, "stub-user-id"))
    .get();

  if (!row) {
    redirect("/onboarding");
  }

  const badgeRows = await db
    .select()
    .from(badges)
    .where(eq(badges.gameStateId, row.id))
    .all();

  const gameState = {
    id: row.id,
    userId: row.userId,
    totalLives: row.totalLives,
    remainingLives: row.remainingLives,
    cigarettesToday: row.cigarettesToday,
    streakDays: row.streakDays,
    lastCigaretteAt: row.lastCigaretteAt,
    lastActionAt: row.lastActionAt,
    nextActionAvailableAt: row.nextActionAvailableAt,
    status: row.status,
    relapseStartedAt: row.relapseStartedAt,
    totalPoints: row.totalPoints,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };

  const resetResult = checkMidnightReset(gameState, new Date());

  const unlockedBadges = badgeRows.map((b) => ({
    key: b.badgeKey,
    unlockedAt: b.unlockedAt,
  }));

  return <DashboardView gameState={resetResult.gameState} badges={unlockedBadges} />;
}
