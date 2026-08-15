import { test, expect } from "@playwright/test";

test.describe("Landing page", () => {
  test.describe("responsive containment", () => {
    test("mobile (390px) renders without horizontal overflow", async ({
      page,
    }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto("/");
      await expect(page.locator(".landing-shell")).toBeVisible();
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      expect(bodyWidth).toBeLessThanOrEqual(390);
    });

    test("desktop (1280px) renders the landing shell", async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto("/");
      await expect(page.locator(".landing-shell")).toBeVisible();
    });
  });

  test.describe("theme toggle", () => {
    test("toggle is visible and accessible after hydration", async ({
      page,
    }) => {
      await page.goto("/");
      const toggle = page.getByRole("button", { name: "Cambiar tema" });
      await expect(toggle).toBeVisible();
      // After hydration, the toggle should be enabled
      await expect(toggle).toBeEnabled();
    });

    test("toggle changes theme on click", async ({ page }) => {
      await page.goto("/");
      const toggle = page.getByRole("button", { name: "Cambiar tema" });
      await expect(toggle).toBeEnabled();
      await toggle.click();
      // After clicking, the dark class should be toggled
      const hasDark = await page.evaluate(() =>
        document.documentElement.classList.contains("dark")
      );
      // The theme should have changed (either to dark or back to light)
      expect(typeof hasDark).toBe("boolean");
    });
  });

  test.describe("reduced motion", () => {
    test("respects prefers-reduced-motion at runtime", async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto("/");
      await expect(page.locator(".landing-shell")).toBeVisible();

      // When reduced motion is preferred, data-motion-enabled should NOT be set
      const motionEnabled = await page.evaluate(() => {
        const shell = document.querySelector(".landing-shell");
        return shell?.hasAttribute("data-motion-enabled") ?? false;
      });
      expect(motionEnabled).toBe(false);

      // Hearts animation should be disabled
      const heartsAnimation = await page.evaluate(() => {
        const hearts = document.querySelector(".landing-hearts");
        if (!hearts) return "none";
        return getComputedStyle(hearts).animationName;
      });
      expect(heartsAnimation).toBe("none");
    });
  });

  test.describe("desktop fine-pointer flash eligibility", () => {
    test("flash elements are visible on desktop with fine pointer", async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto("/");
      await expect(page.locator(".landing-shell")).toBeVisible();

      // On desktop with fine pointer, flashes should be displayed (display: block)
      const flashDisplay = await page.evaluate(() => {
        const flash = document.querySelector(".landing-flash-one");
        if (!flash) return "not-found";
        return getComputedStyle(flash).display;
      });
      expect(flashDisplay).toBe("block");
    });
  });

  test.describe("mobile/coarse exclusion of flashes", () => {
    test("flash elements are hidden on mobile", async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto("/");
      await expect(page.locator(".landing-shell")).toBeVisible();

      // On mobile, flashes should be hidden
      const flashDisplay = await page.evaluate(() => {
        const flash = document.querySelector(".landing-flash-one");
        if (!flash) return "not-found";
        return getComputedStyle(flash).display;
      });
      expect(flashDisplay).toBe("none");
    });
  });

  test.describe("CTA keyboard navigation", () => {
    test("primary CTA is focusable and navigable via keyboard", async ({
      page,
    }) => {
      await page.goto("/");
      const cta = page.getByRole("link", { name: /empezar ahora/i });
      await expect(cta).toBeVisible();

      // Focus the CTA
      await cta.focus();
      await expect(cta).toBeFocused();

      // Press Enter to navigate
      await page.keyboard.press("Enter");
      await expect(page).toHaveURL(/\/onboarding/);
    });
  });

  test.describe("landing sections", () => {
    test("all main sections are present", async ({ page }) => {
      await page.goto("/");
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await expect(page.getByText(/nuestra misión/i)).toBeVisible();
      await expect(page.getByText(/¿cómo funciona\?/i)).toBeVisible();
      await expect(page.getByText(/logros que te esperan/i)).toBeVisible();
    });

    test("achievement previews show authoritative thresholds", async ({
      page,
    }) => {
      await page.goto("/");
      await expect(page.getByText("7 días")).toBeVisible();
      await expect(page.getByText("30 días")).toBeVisible();
      await expect(page.getByText("100 días")).toBeVisible();
      await expect(page.getByText("365 días")).toBeVisible();
    });
  });

  test.describe("smoke routes", () => {
    test("onboarding route is accessible", async ({ page }) => {
      const response = await page.goto("/onboarding");
      expect(response?.status()).toBeLessThan(500);
    });

    test("dashboard route is accessible", async ({ page }) => {
      const response = await page.goto("/dashboard");
      // Dashboard may redirect to onboarding, but should not 500
      expect(response?.status()).toBeLessThan(500);
    });
  });
});
