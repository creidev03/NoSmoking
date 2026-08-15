import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { game_state } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getTimelineEvents } from "../actions";
import { TimelineView } from "@/components/timeline/TimelineView";

export default async function TimelinePage() {
  const row = await db
    .select()
    .from(game_state)
    .where(eq(game_state.userId, "stub-user-id"))
    .get();

  if (!row) {
    redirect("/onboarding");
  }

  const initialData = await getTimelineEvents(row.userId, "all", 0, 20);

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <TimelineView
        userId={row.userId}
        initialEvents={initialData.events}
        initialHasMore={initialData.hasMore}
      />
    </div>
  );
}
