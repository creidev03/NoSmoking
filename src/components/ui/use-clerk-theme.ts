"use client";

import { useEffect, useState } from "react";
import { clerkAppearance, clerkAppearanceDark } from "@/lib/clerk-appearance";
import type { Appearance } from "@clerk/nextjs";

/**
 * Returns Clerk appearance config that matches the current theme (light/dark).
 * Detects via <html> class or prefers-color-scheme media query.
 */
export function useClerkTheme(): Appearance {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const html = document.documentElement;

    const check = () => {
      setIsDark(html.classList.contains("dark"));
    };

    check();

    const observer = new MutationObserver(check);
    observer.observe(html, { attributes: true, attributeFilter: ["class"] });

    return () => observer.disconnect();
  }, []);

  return isDark ? clerkAppearanceDark : clerkAppearance;
}
