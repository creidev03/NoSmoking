import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

/**
 * Middleware that handles locale routing via next-intl,
 * then enforces Clerk auth when configured.
 */
export const middleware = createMiddleware(routing);

export const config = {
  matcher: [
    // Next-intl handles all routes except API, _next, Vercel internals, and static files
    "/((?!api|_next|_vercel|.*\\..*).*)",
  ],
};
