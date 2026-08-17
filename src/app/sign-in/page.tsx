"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Bare /sign-in safety-net page.
 * Redirects to the locale-aware sign-in route (defaults to /es/sign-in).
 * This handles edge cases where Clerk or email links point to /sign-in directly.
 */
export default function BareSignInPage() {
  const router = useRouter();

  useEffect(() => {
    // Try to detect locale from cookie, default to "es"
    const match = document.cookie.match(/NEXT_LOCALE=(es|en)/);
    const locale = match ? match[1] : "es";
    router.replace(`/${locale}/sign-in`);
  }, [router]);

  return null;
}
