import { currentUser, auth } from "@clerk/nextjs/server";

export async function getCurrentUser() {
  const user = await currentUser();
  return user;
}

export async function getAuthUserId() {
  const { userId } = await auth();
  return userId;
}
