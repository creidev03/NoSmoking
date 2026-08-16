import createMiddleware from "next-intl/middleware";
import { routing } from "./routing";

export const middleware = createMiddleware(routing);

export const config = {
  matcher: [
    // Enable a pathnames only for supported locales
    "/((?!api|_next|_vercel|.*\\..*).*)",
  ],
};
