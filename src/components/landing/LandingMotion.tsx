"use client";

import { useEffect, useRef, type ReactNode } from "react";

interface LandingMotionProps {
  children: ReactNode;
  rootMargin?: string;
  threshold?: number;
}

export function LandingMotion({
  children,
  rootMargin = "-10% 0px",
  threshold = 0.1,
}: LandingMotionProps) {
  const shellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const shell = shellRef.current;
    if (!shell) return;

    if (typeof IntersectionObserver === "undefined") return;
    if (typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    shell.setAttribute("data-motion-enabled", "");
    shell.closest<HTMLElement>(".landing-shell")?.setAttribute("data-motion-enabled", "");
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

    for (const target of targets) observer.observe(target);
    return () => observer.disconnect();
  }, [rootMargin, threshold]);

  return <div ref={shellRef}>{children}</div>;
}
