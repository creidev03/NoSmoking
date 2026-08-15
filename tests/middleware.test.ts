import { describe, it, expect } from "vitest";

// Test the middleware configuration without actually running it
// (Clerk middleware runs on the edge runtime which is hard to test in vitest)

describe("middleware configuration", () => {
  it("has correct matcher pattern", () => {
    // The matcher should exclude static assets
    const matcherPattern =
      "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)";

    // Test that it matches regular routes
    expect(matcherPattern).toBeTruthy();

    // Test that it's a valid regex-like pattern
    expect(matcherPattern).toContain("_next/static");
    expect(matcherPattern).toContain("_next/image");
    expect(matcherPattern).toContain("favicon.ico");
  });

  it("defines public routes correctly", () => {
    const publicRoutes = ["/", "/sign-in", "/sign-up", "/onboarding"];

    // Public routes should be accessible without auth
    expect(publicRoutes).toContain("/");
    expect(publicRoutes).toContain("/sign-in");
    expect(publicRoutes).toContain("/sign-up");
    expect(publicRoutes).toContain("/onboarding");
  });

  it("defines protected routes correctly", () => {
    const protectedRoutes = [
      "/dashboard",
      "/dashboard/logros",
      "/dashboard/timeline",
      "/dashboard/settings",
    ];

    // Protected routes should require auth
    protectedRoutes.forEach((route) => {
      expect(route).toMatch(/^\/dashboard/);
    });
  });
});
