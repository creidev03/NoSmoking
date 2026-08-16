import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { game_state } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getTimelineEvents } from "../actions";
import { TimelineView } from "@/components/timeline/TimelineView";
import { setRequestLocale } from "next-intl/server";

export default async function TimelinePage({
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

  const initialData = await getTimelineEvents("all", 0, 20, locale);

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <TimelineView
        initialEvents={initialData.events}
        initialHasMore={initialData.hasMore}
      />
    </div>
  );
}
