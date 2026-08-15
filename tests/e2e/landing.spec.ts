import { test, expect } from "@playwright/test";

test.describe("Landing page", () => {
  test("mobile (390px) has no horizontal overflow", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await expect(page.locator(".landing-shell")).toBeVisible();
    expect(await page.evaluate(() => document.body.scrollWidth)).toBeLessThanOrEqual(390);
  });

  test("desktop (1280px) renders the landing shell", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/");
    await expect(page.locator(".landing-shell")).toBeVisible();
    await expect(page.getByRole("heading", { level: 1, name: /dejarlo no es un momento/i })).toBeVisible();
  });

  test("header CTA is accessible after hydration", async ({ page }) => {
    await page.goto("/");
    const cta = page.getByRole("link", { name: "Empezar" }).first();
    await expect(cta).toBeVisible();
    await expect(cta).toBeEnabled();
    await cta.focus();
    await expect(cta).toBeFocused();
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("reduced motion preserves static content and disables motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await expect(page.locator(".landing-shell")).toBeVisible();
    expect(await page.evaluate(() => document.querySelector(".landing-shell")?.hasAttribute("data-motion-enabled"))).toBe(false);
    expect(await page.evaluate(() => getComputedStyle(document.querySelector('[data-motion-progress="true"]')!).animationName)).toBe("none");
    await expect(page.getByText(/logros que puedes desbloquear/i)).toBeVisible();
  });

  test("flashes are fine-pointer desktop only", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/");
    await expect(page.locator(".landing-flash")).toHaveCount(2);
    const desktopDisplay = await page.locator(".landing-flash-one").evaluate((element) => getComputedStyle(element).display);
    expect(desktopDisplay).toBe("block");

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    const mobileDisplay = await page.locator(".landing-flash-one").evaluate((element) => getComputedStyle(element).display);
    expect(mobileDisplay).toBe("none");
  });

  test("primary CTA navigates to onboarding", async ({ page }) => {
    await page.goto("/");
    const cta = page.getByRole("link", { name: "Empezar" }).last();
    await cta.focus();
    await expect(cta).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/onboarding/);
  });

  test("renders authoritative achievement thresholds", async ({ page }) => {
    await page.goto("/");
    for (const days of ["7 días", "30 días", "100 días", "365 días"]) {
      await expect(page.getByText(days, { exact: true })).toBeVisible();
    }
  });
});

test.describe("Smoke: navigation routes", () => {
  test("onboarding route loads", async ({ page }) => {
    const response = await page.goto("/onboarding");
    expect(response?.status()).toBeLessThan(500);
  });

  test("dashboard route loads", async ({ page }) => {
    const response = await page.goto("/dashboard");
    expect(response?.status()).toBeLessThan(500);
  });
});
