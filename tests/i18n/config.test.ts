import { describe, it, expect } from "vitest";

describe("i18n routing config", () => {
  it("exports locales as es and en", async () => {
    const { routing } = await import("@/i18n/routing");
    expect(routing.locales).toEqual(["es", "en"]);
  });

  it("exports defaultLocale as es", async () => {
    const { routing } = await import("@/i18n/routing");
    expect(routing.defaultLocale).toBe("es");
  });

  it("exports localePrefix as always", async () => {
    const { routing } = await import("@/i18n/routing");
    expect(routing.localePrefix).toBe("always");
  });
});
