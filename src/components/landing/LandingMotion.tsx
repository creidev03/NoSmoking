"use client";

import { useEffect, useRef, type ReactNode } from "react";

interface LandingMotionProps {
  children: ReactNode;
  /** Root margin for IntersectionObserver (default: "-10% 0px") */
  rootMargin?: string;
  /** Threshold for IntersectionObserver (default: 0.1) */
  threshold?: number;
}

/**
 * Client boundary that observes [data-motion-reveal] elements and marks
 * first intersections with data-revealed="true". Content stays fully
 * visible without IntersectionObserver or when reduced motion is preferred.
 */
export function LandingMotion({
  children,
  rootMargin = "-10% 0px",
  threshold = 0.1,
}: LandingMotionProps) {
  const shellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const shell = shellRef.current;
    if (!shell) return;

    // Respect reduced motion — do not enable motion at all
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced) return;

    // Check for IntersectionObserver support
    if (typeof IntersectionObserver === "undefined") return;

    // Enable motion on the shell so CSS targets become active
    shell.setAttribute("data-motion-enabled", "");

    const targets = shell.querySelectorAll<HTMLElement>("[data-motion-reveal]");
    if (targets.length === 0) return;

    const revealed = new Set<Element>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !revealed.has(entry.target)) {
            entry.target.setAttribute("data-revealed", "true");
            revealed.add(entry.target);
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin, threshold }
    );

    for (const target of targets) {
      observer.observe(target);
    }

    return () => {
      observer.disconnect();
    };
  }, [rootMargin, threshold]);

  return <div ref={shellRef}>{children}</div>;
}
