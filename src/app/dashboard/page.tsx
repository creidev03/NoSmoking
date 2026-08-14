import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { game_state } from "@/db/schema";
import { eq } from "drizzle-orm";
import { checkMidnightReset } from "@/lib/game-state";
import { DashboardView } from "@/components/dashboard/DashboardView";

export default async function DashboardPage() {
  const row = await db
    .select()
    .from(game_state)
    .where(eq(game_state.userId, "current-user"))
    .get();

  if (!row) {
    redirect("/onboarding");
  }

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
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };

  const resetState = checkMidnightReset(gameState, new Date());

  return <DashboardView gameState={resetState} />;
}
