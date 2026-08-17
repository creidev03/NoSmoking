"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Bare /sign-up safety-net page.
 * Redirects to the locale-aware sign-up route (defaults to /es/sign-up).
 * This handles edge cases where Clerk or email links point to /sign-up directly.
 */
export default function BareSignUpPage() {
  const router = useRouter();

  useEffect(() => {
    // Try to detect locale from cookie, default to "es"
    const match = document.cookie.match(/NEXT_LOCALE=(es|en)/);
    const locale = match ? match[1] : "es";
    router.replace(`/${locale}/sign-up`);
  }, [router]);

  return null;
}
