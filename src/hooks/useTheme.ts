"use client";

import { useState, useEffect, useCallback, useRef } from "react";

type Theme = "light" | "dark" | "system";

// Module-level shared state
let globalTheme: Theme = "system";
let globalResolved: "light" | "dark" = "light";
const subscribers = new Set<() => void>();

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function getStoredTheme(): Theme {
  if (typeof window === "undefined") return "system";
  return (localStorage.getItem("theme") as Theme) || "system";
}

function applyTheme(theme: "light" | "dark") {
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}

function syncTheme(newTheme: Theme) {
  if (typeof window === "undefined") return;

  localStorage.setItem("theme", newTheme);
  globalTheme = newTheme;

  const resolved = newTheme === "system" ? getSystemTheme() : newTheme;
  globalResolved = resolved;
  applyTheme(resolved);

  for (const subscriber of subscribers) {
    subscriber();
  }
}

export function useTheme(initialTheme?: Theme) {
  const [, forceRender] = useState(0);
  const lastInitialRef = useRef<Theme | undefined>(undefined);

  // Apply stored theme on every mount (navigation resets module state)
  useEffect(() => {
    const themeToUse = initialTheme ?? getStoredTheme();
    const resolved = themeToUse === "system" ? getSystemTheme() : themeToUse;

    localStorage.setItem("theme", themeToUse);
    lastInitialRef.current = initialTheme;
    globalTheme = themeToUse;
    globalResolved = resolved;
    applyTheme(resolved);
    forceRender((n) => n + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-apply when initialTheme changes (e.g., DB loads after first render)
  useEffect(() => {
    if (initialTheme === lastInitialRef.current) return;
    lastInitialRef.current = initialTheme;

    const themeToUse = initialTheme ?? getStoredTheme();
    const resolved = themeToUse === "system" ? getSystemTheme() : themeToUse;

    localStorage.setItem("theme", themeToUse);
    globalTheme = themeToUse;
    globalResolved = resolved;
    applyTheme(resolved);
    forceRender((n) => n + 1);
  }, [initialTheme]);

  // Subscribe to changes from other useTheme instances
  useEffect(() => {
    const bump = () => forceRender((n) => n + 1);
    subscribers.add(bump);
    return () => {
      subscribers.delete(bump);
    };
  }, []);

  // OS preference listener
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (globalTheme === "system") {
        const newResolved = getSystemTheme();
        globalResolved = newResolved;
        applyTheme(newResolved);
        for (const subscriber of subscribers) {
          subscriber();
        }
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const setTheme = useCallback((newTheme: Theme) => {
    syncTheme(newTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    const next = globalResolved === "light" ? "dark" : "light";
    syncTheme(next);
  }, []);

  const mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;
  }, []);

  return {
    theme: globalTheme,
    resolvedTheme: globalResolved,
    setTheme,
    toggleTheme,
    mounted: mounted.current,
  };
}
