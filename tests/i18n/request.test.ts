import { describe, it, expect, vi } from "vitest";

vi.mock("next-intl/server", () => ({
  getRequestConfig: (fn: (config: { requestLocale: Promise<string | undefined> }) => Promise<unknown>) => fn,
}));

vi.mock("@/i18n/routing", () => ({
  routing: { locales: ["es", "en"], defaultLocale: "es" },
}));

describe("i18n request config", () => {
  it("exports a getRequestConfig function", async () => {
    const mod = await import("@/i18n/request");
    expect(typeof mod.default).toBe("function");
  });

  it("getRequestConfig returns messages for a valid locale", async () => {
    const getConfig = (await import("@/i18n/request")).default;
    const result = await getConfig({ requestLocale: Promise.resolve("es") });
    expect(result).toHaveProperty("messages");
    expect(result.messages).toBeDefined();
  });

  it("getRequestConfig falls back to default locale for invalid locale", async () => {
    const getConfig = (await import("@/i18n/request")).default;
    const result = await getConfig({ requestLocale: Promise.resolve("fr") });
    expect(result).toHaveProperty("messages");
    expect(result.locale).toBe("es");
  });
});
