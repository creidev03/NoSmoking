"use client";

import { ClerkProvider, esMX } from "@clerk/nextjs";

/**
 * Spanish ClerkProvider wrapper — used inside route group (es).
 * Does NOT render <html> or <body> — that's the root layout's job.
 */
export function SpanishClerkProvider({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider afterSignOutUrl="/" localization={esMX}>
      {children}
    </ClerkProvider>
  );
}
