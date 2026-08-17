/**
 * Database seed script — idempotent (safe to run on every build).
 * Inserts achievement definitions into the `achievements` table using
 * INSERT OR IGNORE so it never overwrites existing data.
 *
 * Usage: npx tsx src/db/seed.ts
 * Runs automatically as part of the Vercel build (postbuild hook).
 */
import { db } from "@/lib/db";
import { achievements } from "@/db/schema";
import { ACHIEVEMENT_SEEDS } from "@/lib/achievements/seed";

async function seed() {
  let inserted = 0;

  for (const seed of ACHIEVEMENT_SEEDS) {
    try {
      await db
        .insert(achievements)
        .values({
          id: seed.id,
          name: seed.name,
          icon: seed.icon,
          category: seed.category,
          difficulty: seed.difficulty,
          isSecret: seed.isSecret,
          description: seed.description,
          conditionType: seed.conditionType,
          conditionValue: String(seed.conditionValue),
          createdAt: new Date().toISOString(),
        })
        .onConflictDoNothing();
      inserted++;
    } catch (err) {
      // Skip duplicates or constraint errors — this is idempotent
      console.error(`[seed] Skipped ${seed.id}:`, (err as Error).message);
    }
  }

  console.log(`[seed] Done — ${inserted}/${ACHIEVEMENT_SEEDS.length} achievements processed`);
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("[seed] Fatal error:", err);
    // Don't fail the build — seed failures are non-blocking
    process.exit(0);
  });
