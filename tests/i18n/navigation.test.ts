import { describe, it, expect, vi } from "vitest";

vi.mock("next/navigation", () => ({
  usePathname: () => "/es/dashboard",
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }),
  redirect: vi.fn(),
}));

vi.mock("next-intl/navigation", () => {
  const routing = {
    locales: ["es", "en"],
    defaultLocale: "es",
    localePrefix: "always",
  };

  return {
    createNavigation: (_routing: unknown) => ({
      Link: (props: Record<string, unknown>) => props,
      redirect: vi.fn(),
      usePathname: () => "/es/dashboard",
      useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }),
    }),
  };
});

describe("i18n navigation", () => {
  it("exports Link component", async () => {
    const nav = await import("@/i18n/navigation");
    expect(nav.Link).toBeDefined();
  });

  it("exports redirect function", async () => {
    const nav = await import("@/i18n/navigation");
    expect(typeof nav.redirect).toBe("function");
  });

  it("exports usePathname hook", async () => {
    const nav = await import("@/i18n/navigation");
    expect(typeof nav.usePathname).toBe("function");
  });

  it("exports useRouter hook", async () => {
    const nav = await import("@/i18n/navigation");
    expect(typeof nav.useRouter).toBe("function");
  });
});
