import { describe, it, expect, vi } from "vitest";

vi.mock("next/server", () => ({
  NextResponse: { next: vi.fn(), redirect: vi.fn() },
  NextRequest: vi.fn(),
}));

vi.mock("next-intl/middleware", () => ({
  default: (_routing: unknown) => vi.fn(),
}));

describe("i18n middleware", () => {
  it("exports a middleware function", async () => {
    const mod = await import("@/i18n/middleware-config");
    expect(typeof mod.middleware).toBe("function");
  });

  it("exports a config with matcher", async () => {
    const mod = await import("@/i18n/middleware-config");
    expect(mod.config).toBeDefined();
    expect(mod.config.matcher).toBeDefined();
    expect(Array.isArray(mod.config.matcher)).toBe(true);
    expect(mod.config.matcher.length).toBeGreaterThan(0);
  });

  it("matcher excludes _next static files", async () => {
    const mod = await import("@/i18n/middleware-config");
    const matcher = mod.config.matcher[0] as string;
    expect(matcher).toContain("_next");
  });

  it("matcher excludes static files by extension", async () => {
    const mod = await import("@/i18n/middleware-config");
    const matcher = mod.config.matcher[0] as string;
    // The pattern uses .*\\..* to match any file extension (svg, png, jpg, etc.)
    expect(matcher).toContain(".*\\..*");
  });
});
