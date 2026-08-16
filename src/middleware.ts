import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { routing } from "@/i18n/routing";

const intlMiddleware = createMiddleware(routing);

const isPublicRoute = createRouteMatcher([
  "/es/sign-in(.*)",
  "/es/sign-up(.*)",
  "/en/sign-in(.*)",
  "/en/sign-up(.*)",
  "/es/onboarding(.*)",
  "/en/onboarding(.*)",
  "/:locale",
  "/",
]);

/**
 * Combined middleware: Clerk (auth) + next-intl (locale).
 * Clerk runs first to protect routes, then next-intl handles locale.
 */
export default clerkMiddleware(async (auth, request) => {
  // Protect private routes
  if (!isPublicRoute(request)) {
    await auth.protect();
  }

  // Let next-intl handle locale detection/redirect
  return intlMiddleware(request as NextRequest);
});

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
