import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

describe("middleware (Clerk-only, reverted from next-intl)", () => {
  it("does NOT import next-intl/middleware", () => {
    const source = readFileSync(
      join(process.cwd(), "src/middleware.ts"),
      "utf-8"
    );
    expect(source).not.toContain("next-intl/middleware");
  });

  it("does NOT import i18n routing", () => {
    const source = readFileSync(
      join(process.cwd(), "src/middleware.ts"),
      "utf-8"
    );
    expect(source).not.toContain("@/i18n/routing");
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

describe("[locale] route (reverted)", () => {
  it("does NOT have src/app/[locale]/layout.tsx", () => {
    const fs = require("fs");
    const layoutPath = join(
      process.cwd(),
      "src/app/[locale]/layout.tsx"
    );
    expect(fs.existsSync(layoutPath)).toBe(false);
  });

  it("does NOT have src/app/[locale]/page.tsx", () => {
    const fs = require("fs");
    const pagePath = join(
      process.cwd(),
      "src/app/[locale]/page.tsx"
    );
    expect(fs.existsSync(pagePath)).toBe(false);
  });

  it("root layout has html lang attribute", () => {
    const rootSource = readFileSync(
      join(process.cwd(), "src/app/layout.tsx"),
      "utf-8"
    );
    expect(rootSource).toContain("suppressHydrationWarning");
    expect(rootSource).toContain("<html");
  });
});
