import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware that enforces Clerk auth when configured,
 * or passes through all requests when Clerk keys are placeholders.
 */
export function middleware(request: NextRequest) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  // Skip auth when Clerk is not configured (placeholder keys)
  if (!publishableKey || publishableKey.includes("placeholder")) {
    return NextResponse.next();
  }

  // Clerk is configured — use its middleware dynamically
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { clerkMiddleware, createRouteMatcher } = require("@clerk/nextjs/server");
  const isPublicRoute = createRouteMatcher([
    "/",
    "/sign-in(.*)",
    "/sign-up(.*)",
    "/onboarding(.*)",
  ]);

  return clerkMiddleware(async (auth: any) => {
    if (!isPublicRoute(request)) {
      await auth.protect();
    }
  })(request, {} as any);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
