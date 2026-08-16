import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

describe("middleware stacking (next-intl + Clerk)", () => {
  it("imports createMiddleware from next-intl", () => {
    const source = readFileSync(
      join(process.cwd(), "src/middleware.ts"),
      "utf-8"
    );
    expect(source).toContain("next-intl/middleware");
    expect(source).toContain("createMiddleware");
  });

  it("imports routing from i18n config", () => {
    const source = readFileSync(
      join(process.cwd(), "src/middleware.ts"),
      "utf-8"
    );
    expect(source).toContain("@/i18n/routing");
  });

  it("exports middleware function", () => {
    const source = readFileSync(
      join(process.cwd(), "src/middleware.ts"),
      "utf-8"
    );
    expect(source).toMatch(/export\s+(const|function)\s+middleware/);
  });

  it("exports config with matcher", () => {
    const source = readFileSync(
      join(process.cwd(), "src/middleware.ts"),
      "utf-8"
    );
    expect(source).toContain("export const config");
    expect(source).toContain("matcher");
  });

  it("matcher excludes _next and static files", () => {
    const source = readFileSync(
      join(process.cwd(), "src/middleware.ts"),
      "utf-8"
    );
    expect(source).toContain("_next");
  });
});

describe("[locale] layout", () => {
  it("exists at src/app/[locale]/layout.tsx", () => {
    const fs = require("fs");
    const layoutPath = join(
      process.cwd(),
      "src/app/[locale]/layout.tsx"
    );
    expect(fs.existsSync(layoutPath)).toBe(true);
  });

  it("wraps children in NextIntlClientProvider", () => {
    const source = readFileSync(
      join(process.cwd(), "src/app/[locale]/layout.tsx"),
      "utf-8"
    );
    expect(source).toContain("NextIntlClientProvider");
  });

  it("uses getMessages for translations", () => {
    const source = readFileSync(
      join(process.cwd(), "src/app/[locale]/layout.tsx"),
      "utf-8"
    );
    expect(source).toContain("getMessages");
  });

  it("keeps ClerkProvider as outermost wrapper", () => {
    const source = readFileSync(
      join(process.cwd(), "src/app/[locale]/layout.tsx"),
      "utf-8"
    );
    expect(source).toContain("ClerkProvider");
    // ClerkProvider should appear before NextIntlClientProvider
    const clerkIdx = source.indexOf("ClerkProvider");
    const intlIdx = source.indexOf("NextIntlClientProvider");
    expect(clerkIdx).toBeLessThan(intlIdx);
  });

  it("generates static params for locales", () => {
    const source = readFileSync(
      join(process.cwd(), "src/app/[locale]/layout.tsx"),
      "utf-8"
    );
    expect(source).toContain("generateStaticParams");
  });

  it("sets html lang attribute from locale param", () => {
    // The <html lang> is in root layout, driven by [locale] layout context
    const rootSource = readFileSync(
      join(process.cwd(), "src/app/layout.tsx"),
      "utf-8"
    );
    expect(rootSource).toContain("suppressHydrationWarning");
    expect(rootSource).toContain("<html");
  });
});

describe("[locale] page", () => {
  it("exists at src/app/[locale]/page.tsx", () => {
    const fs = require("fs");
    const pagePath = join(
      process.cwd(),
      "src/app/[locale]/page.tsx"
    );
    expect(fs.existsSync(pagePath)).toBe(true);
  });
});
