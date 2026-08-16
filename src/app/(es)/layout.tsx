import { SpanishClerkProvider } from "@/components/clerk-provider-es";

/**
 * Route group layout for Spanish sign-in/sign-up.
 * Does NOT include <html> or <body> — nested inside root layout.
 * Provides Spanish localization via ClerkProvider.
 */
export default function SpanishLayout({ children }: { children: React.ReactNode }) {
  return <SpanishClerkProvider>{children}</SpanishClerkProvider>;
}
