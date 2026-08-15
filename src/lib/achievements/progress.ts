import { db } from "@/lib/db";
import { achievementProgress } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function getProgress(
  userId: string,
  achievementId: string
): Promise<number> {
  const rows = await db
    .select()
    .from(achievementProgress)
    .where(
      and(
        eq(achievementProgress.userId, userId),
        eq(achievementProgress.achievementId, achievementId)
      )
    )
    .limit(1);

  return rows.length > 0 ? rows[0].currentValue : 0;
}

export async function updateProgress(
  userId: string,
  achievementId: string,
  value: number
): Promise<void> {
  const existing = await getProgress(userId, achievementId);

  if (existing > 0) {
    await db
      .update(achievementProgress)
      .set({
        currentValue: value,
        lastUpdated: new Date().toISOString(),
      })
      .where(
        and(
          eq(achievementProgress.userId, userId),
          eq(achievementProgress.achievementId, achievementId)
        )
      );
  } else {
    await db.insert(achievementProgress).values({
      userId,
      achievementId,
      currentValue: value,
      lastUpdated: new Date().toISOString(),
    });
  }
}

export async function incrementProgress(
  userId: string,
  achievementId: string
): Promise<void> {
  const existing = await getProgress(userId, achievementId);

  if (existing > 0) {
    await db
      .update(achievementProgress)
      .set({
        currentValue: existing + 1,
        lastUpdated: new Date().toISOString(),
      })
      .where(
        and(
          eq(achievementProgress.userId, userId),
          eq(achievementProgress.achievementId, achievementId)
        )
      );
  } else {
    await db.insert(achievementProgress).values({
      userId,
      achievementId,
      currentValue: 1,
      lastUpdated: new Date().toISOString(),
    });
  }
}
