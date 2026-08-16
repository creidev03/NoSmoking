import { auth } from "@clerk/nextjs/server";

export async function requireAuth(): Promise<{ userId: string }> {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  return { userId };
}
