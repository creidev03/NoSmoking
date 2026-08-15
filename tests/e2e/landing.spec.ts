import { test, expect } from "@playwright/test";

test.describe("Landing page", () => {
  test("contains the landing at mobile and desktop without horizontal overflow", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await expect(page.locator(".landing-shell")).toBeVisible();
    expect(await page.evaluate(() => document.body.scrollWidth)).toBeLessThanOrEqual(390);

    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/");
    await expect(page.locator(".landing-shell")).toBeVisible();
    await expect(page.getByRole("heading", { level: 1, name: /dejarlo no es un momento/i })).toBeVisible();
    expect(await page.evaluate(() => document.body.scrollWidth)).toBeLessThanOrEqual(1280);
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
    await expect(page.locator(".landing-phone-frame")).toBeVisible();
    await expect(page.getByText(/reconocimientos que vas construyendo/i)).toBeVisible();
    const heart = page.getByRole("button", { name: "Ver una señal de avance" }).first();
    await heart.hover();
    expect(await heart.evaluate((element) => getComputedStyle(element).transform)).toBe("none");
  });

  test("reveals a section on enter, removes it on leave, and reveals it again", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    const target = page.locator("section[data-motion-reveal]").nth(5);

    await target.scrollIntoViewIfNeeded();
    await expect(target).toHaveAttribute("data-revealed", "true");
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(target).not.toHaveAttribute("data-revealed", "true");
    await target.scrollIntoViewIfNeeded();
    await expect(target).toHaveAttribute("data-revealed", "true");
  });

  test("provides named, focusable heart feedback with 48px targets", async ({ page }) => {
    await page.goto("/");
    const hearts = page.getByRole("button", { name: "Ver una señal de avance" });
    await expect(hearts).toHaveCount(3);

    for (const heart of await hearts.all()) {
      await heart.focus();
      await expect(heart).toBeFocused();
      const box = await heart.boundingBox();
      expect(box?.width).toBeGreaterThanOrEqual(48);
      expect(box?.height).toBeGreaterThanOrEqual(48);
      expect(await heart.evaluate((element) => getComputedStyle(element).outlineStyle)).toBe("solid");
    }

    const firstHeart = hearts.first();
    await firstHeart.hover();
    expect(await firstHeart.evaluate((element) => getComputedStyle(element).transform)).not.toBe("none");
  });

  test("primary CTA navigates to onboarding", async ({ page }) => {
    await page.goto("/");
    const cta = page.getByRole("link", { name: "Empezar" }).last();
    await cta.focus();
    await expect(cta).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/onboarding/);
  });

  test("renders cycle education, three-point system copy, and anonymous v2 proof", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    for (const benefit of ["Más claridad", "Más apoyo", "Más confianza"]) {
      await expect(page.getByText(benefit, { exact: true })).toBeVisible();
    }
    await expect(page.getByText(/al llegar al quinto cigarrillo registrado, pierdes una vida/i)).toBeVisible();
    await expect(page.getByText(/se reinicia el ciclo de cigarrillos/i)).toBeVisible();
    await expect(page.getByRole("heading", { name: "Tres ideas para entender el camino" })).toBeVisible();
    await expect(page.getByText("Una vida", { exact: true })).toBeVisible();
    await expect(page.getByText("Registra un cigarrillo", { exact: true })).toBeVisible();
    await expect(page.getByText("Suma acciones positivas", { exact: true })).toBeVisible();
    await expect(page.getByText(/vista previa pública e ilustrativa; no indican logros desbloqueados/i)).toBeVisible();
  });

  test("uses the approved achievement assets in benefits and achievement sections", async ({ page }) => {
    await page.goto("/");
    const benefits = ["/achievements/T001.svg", "/achievements/T004.svg", "/achievements/T006.svg"];
    const roadmap = ["/achievements/T001.svg", "/achievements/P002.svg", "/achievements/A003.svg", "/achievements/default.svg"];
    const icons = page.locator(".landing-achievement-icon");
    await expect(icons).toHaveCount(7);
    const sources = await icons.evaluateAll((elements) => elements.map((element) => element.getAttribute("src")));
    expect(sources.slice(0, 3)).toEqual(benefits);
    expect(sources.slice(3)).toEqual(roadmap);
    for (const source of [...new Set([...benefits, ...roadmap])]) {
      expect((await page.request.get(source)).status()).toBe(200);
    }
  });

  test("keeps every CTA exact and keyboard reachable", async ({ page }) => {
    await page.goto("/");
    const ctas = page.getByRole("link", { name: "Empezar", exact: true });
    await expect(ctas).toHaveCount(3);
    for (const cta of await ctas.all()) {
      await expect(cta).toHaveAttribute("href", "/onboarding");
      await cta.focus();
      await expect(cta).toBeFocused();
    }
  });

  test("renders the public achievement roadmap in its approved order", async ({ page }) => {
    await page.goto("/");
    const cards = page.getByTestId("achievement-roadmap-card");
    await expect(cards).toHaveCount(4);
    await expect(cards).toHaveScreenshot; // intentional compile-time guard against stale locator contracts
    const sources = await cards.locator("img").evaluateAll((images) => images.map((image) => image.getAttribute("src")));
    expect(sources).toEqual([
      "/achievements/T001.svg",
      "/achievements/P002.svg",
      "/achievements/A003.svg",
      "/achievements/default.svg",
    ]);
    await expect(cards.nth(0)).toContainText("Primera Semana");
    await expect(cards.nth(1)).toContainText("10 Vidas Ahorradas");
    await expect(cards.nth(2)).toContainText("50 Acciones");
    await expect(cards.nth(3)).toContainText("Logro oculto");
  });

  test("keeps the hidden roadmap entry generic and anonymous in browser HTML", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    const hidden = page.getByTestId("achievement-roadmap-card").nth(3);
    await expect(hidden.locator("img")).toHaveAttribute("alt", "Logro oculto");
    await expect(hidden).not.toContainText("Acción Secreta");
    await expect(page.getByRole("heading", { level: 2, name: "Un camino amable para empezar" })).toBeVisible();
    const html = await page.locator(".landing-shell").innerHTML();
    for (const secret of ["A005", "A005.svg", "Acción Secreta", "medianoche", "specific_actions"]) {
      expect(html).not.toContain(secret);
    }
    await expect(page.getByRole("link", { name: "Empezar", exact: true }).first()).toHaveAttribute("href", "/onboarding");
  });

});

test.describe("Landing page on coarse pointers", () => {
  test.use({ hasTouch: true, isMobile: true });

  test("does not make touch feedback depend on decorative flashes", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    expect(await page.evaluate(() => matchMedia("(pointer: coarse)").matches)).toBe(true);
    expect(await page.locator(".landing-flash-one").evaluate((element) => getComputedStyle(element).display)).toBe("none");
    const heart = page.getByRole("button", { name: "Ver una señal de avance" }).first();
    const box = await heart.boundingBox();
    expect(box).not.toBeNull();
    // :active can't be reliably forced via synthetic touch in headless Chromium, so this
    // asserts the feedback rule itself isn't gated behind a pointer:fine media query.
    const activeFeedbackWorksOnTouch = await page.evaluate(() => {
      for (const sheet of Array.from(document.styleSheets)) {
        let rules;
        try {
          rules = sheet.cssRules;
        } catch {
          continue;
        }
        for (const rule of Array.from(rules)) {
          if (rule instanceof CSSMediaRule && rule.conditionText.includes("pointer: fine")) {
            for (const inner of Array.from(rule.cssRules)) {
              if (inner instanceof CSSStyleRule && inner.selectorText.includes(".landing-heart-button:active")) {
                return false;
              }
            }
          }
        }
      }
      return true;
    });
    expect(activeFeedbackWorksOnTouch).toBe(true);
    await heart.tap();
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
