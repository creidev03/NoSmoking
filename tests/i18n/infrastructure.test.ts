import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

describe("middleware (next-intl)", () => {
  it("imports next-intl/middleware", () => {
    const source = readFileSync(
      join(process.cwd(), "src/middleware.ts"),
      "utf-8"
    );
    expect(source).toContain("next-intl/middleware");
  });

  it("imports i18n routing", () => {
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
    // Supports both `export function middleware` and `export default clerkMiddleware(...)`
    expect(source).toMatch(/export\s+(default\s+clerkMiddleware|const\s+middleware|function\s+middleware)/);
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

describe("[locale] route", () => {
  it("has src/app/[locale]/layout.tsx", () => {
    const fs = require("fs");
    const layoutPath = join(
      process.cwd(),
      "src/app/[locale]/layout.tsx"
    );
    expect(fs.existsSync(layoutPath)).toBe(true);
  });

  it("has src/app/[locale]/page.tsx", () => {
    const fs = require("fs");
    const pagePath = join(
      process.cwd(),
      "src/app/[locale]/page.tsx"
    );
    expect(fs.existsSync(pagePath)).toBe(true);
  });

  it("locale layout has html lang attribute via root layout", () => {
    const layoutSource = readFileSync(
      join(process.cwd(), "src/app/[locale]/layout.tsx"),
      "utf-8"
    );
    expect(layoutSource).toContain("suppressHydrationWarning");
    expect(layoutSource).toContain("<html");
  });

  it("root layout is a thin shell", () => {
    const rootSource = readFileSync(
      join(process.cwd(), "src/app/layout.tsx"),
      "utf-8"
    );
    // Root layout should NOT have ClerkProvider or html tag
    expect(rootSource).not.toContain("ClerkProvider");
    expect(rootSource).not.toContain("<html");
  });
});
