import { db } from "@/lib/db";
import { game_state, events, userAchievements } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { ACHIEVEMENT_SEEDS } from "./seed";
import { getProgress, updateProgress, incrementProgress } from "./progress";
import {
  checkStreakDays,
  checkTotalActions,
  checkMilestone,
  checkTimeRange,
  checkCollection,
  checkConsecutiveDaysAction,
  checkNoPenalties,
  checkPhaseActions,
  type ConditionResult,
} from "./conditions";

/**
 * Evaluate all achievements for a user and return newly unlocked ones.
 *
 * Flow:
 * 1. Get game state for user
 * 2. Get events for user
 * 3. Get already-unlocked achievements
 * 4. For each achievement not yet unlocked:
 *    a. Check condition using appropriate checker
 *    b. Update progress
 *    c. If met, insert into user_achievements
 * 5. Return list of newly unlocked achievement IDs
 */
export async function evaluateAchievements(
  userId: string
): Promise<{ unlocked: string[] }> {
  const newlyUnlocked: string[] = [];

  // 1. Get game state
  const gameStates = await db
    .select()
    .from(game_state)
    .where(eq(game_state.userId, userId))
    .limit(1);

  if (gameStates.length === 0) {
    return { unlocked: [] };
  }

  const gs = gameStates[0];

  // 2. Get events
  const userEvents = await db
    .select()
    .from(events)
    .where(eq(events.gameStateId, gs.id));

  // 3. Get already-unlocked achievements
  const unlockedRows = await db
    .select()
    .from(userAchievements)
    .where(eq(userAchievements.userId, userId));

  const unlockedIds = new Set(unlockedRows.map((r) => r.achievementId));

  // 4. Evaluate each achievement
  for (const seed of ACHIEVEMENT_SEEDS) {
    // Skip already unlocked
    if (unlockedIds.has(seed.id)) continue;

    const target = Number(seed.conditionValue);
    const currentProgress = await getProgress(userId, seed.id);

    let result: ConditionResult;

    switch (seed.conditionType) {
      case "streak_days":
        result = checkStreakDays(gs.streakDays, target);
        break;

      case "total_actions":
        result = checkTotalActions(userEvents, "positive_action", target);
        break;

      case "milestones":
        result = checkMilestone(gs.totalLives, target);
        break;

      case "cumulative_count":
        result = checkMilestone(gs.totalCigarettesAllTime, target);
        break;

      case "time_based": {
        const hour = new Date().getHours();
        // Parse conditionValue as "start-end" (e.g. "22-6" for midnight wrap)
        const [startStr, endStr] = seed.conditionValue.split("-");
        const start = Number(startStr);
        const end = Number(endStr);
        result = checkTimeRange(hour, start, end);
        break;
      }

      case "collection": {
        // Count unlocked achievements in the target category
        const category = seed.conditionValue;
        const totalInCategory = ACHIEVEMENT_SEEDS.filter(
          (a) => a.category === category
        ).length;
        const unlockedInCategory = ACHIEVEMENT_SEEDS.filter(
          (a) => a.category === category && unlockedIds.has(a.id)
        ).length;
        result = checkCollection(unlockedInCategory, totalInCategory);
        break;
      }

      case "consecutive_days_bad":
        result = checkConsecutiveDaysAction(userEvents, "cigarette", target);
        break;

      case "consecutive_days_action":
        result = checkConsecutiveDaysAction(
          userEvents,
          "positive_action",
          target
        );
        break;

      case "specific_actions":
        // Handle midnight action or other specific event types
        result = checkTotalActions(userEvents, seed.conditionValue, 1);
        break;

      case "no_penalties":
        result = checkNoPenalties(userEvents, target);
        break;

      case "phase_actions": {
        const [phase, countStr] = seed.conditionValue.split(":");
        const count = Number(countStr) || 1;
        result = checkPhaseActions(userEvents, phase, count);
        break;
      }

      default:
        // Unknown condition type — skip
        continue;
    }

    // Update progress
    if (currentProgress > 0) {
      await incrementProgress(userId, seed.id);
    } else {
      await updateProgress(userId, seed.id, Math.round(result.progress * 100));
    }

    // If condition met — unlock
    if (result.met) {
      const now = new Date().toISOString();
      await db.insert(userAchievements).values({
        userId,
        achievementId: seed.id,
        unlockedAt: now,
        createdAt: now,
      });
      newlyUnlocked.push(seed.id);
    }
  }

  return { unlocked: newlyUnlocked };
}
