import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { routing } from "@/i18n/routing";
import { db } from "@/lib/db";
import { onboardingResponses } from "@/db/schema";
import { eq } from "drizzle-orm";

const intlMiddleware = createMiddleware(routing);

const isPublicRoute = createRouteMatcher([
  "/es/sign-in(.*)",
  "/es/sign-up(.*)",
  "/en/sign-in(.*)",
  "/en/sign-up(.*)",
  "/sign-in(.*)",     // bare path safety net
  "/sign-up(.*)",     // bare path safety net
  "/:locale",
  "/",
]);

/**
 * Check if user has completed onboarding by querying the onboarding_responses table.
 */
async function hasCompletedOnboarding(userId: string): Promise<boolean> {
  const result = await db
    .select({ completedAt: onboardingResponses.completedAt })
    .from(onboardingResponses)
    .where(eq(onboardingResponses.userId, userId))
    .limit(1);

  return result.length > 0 && result[0].completedAt !== null;
}

/**
 * Combined middleware: Clerk (auth) + next-intl (locale).
 * Clerk runs first to protect routes, then next-intl handles locale.
 * After auth, checks onboarding status to redirect appropriately.
 */
export default clerkMiddleware(async (auth, request) => {
  const isProtected = !isPublicRoute(request);

  // Protect private routes
  if (isProtected) {
    await auth.protect();
  }

  // Smart redirect: check onboarding status for authenticated users
  // After auth.protect(), call auth() to get the userId
  const authState = await auth();
  if (isProtected && authState.userId) {
    const pathname = request.nextUrl.pathname;

    // Extract locale from pathname (e.g., "/es/dashboard" → "es")
    const localeMatch = pathname.match(/^\/(es|en)/);
    const locale = localeMatch ? localeMatch[1] : "es";

    // Check if user has completed onboarding
    const completed = await hasCompletedOnboarding(authState.userId);

    // If navigating to dashboard but hasn't completed onboarding → redirect to onboarding
    if (pathname.includes("/dashboard") && !completed) {
      return NextResponse.redirect(new URL(`/${locale}/onboarding`, request.url));
    }

    // If navigating to onboarding but has completed onboarding → redirect to dashboard
    if (pathname.includes("/onboarding") && completed) {
      return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
    }
  }

  // Let next-intl handle locale detection/redirect
  return intlMiddleware(request as NextRequest);
});

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
