import { test, expect } from "@playwright/test";

test.describe("Onboarding wizard flow", () => {
  test("completes full wizard and lands on /dashboard", async ({ page }) => {
    // Step 1: Navigate to onboarding
    await page.goto("/onboarding");

    // Wait for the wizard to load
    await expect(page.getByText("¿Cuántos cigarrillos fumas al día")).toBeVisible();

    // Step 1: Select cigarettes per day (21-40 range → value 30)
    await page.getByRole("button", { name: "21-40" }).click();

    // Step 2: Should advance to years step
    await expect(page.getByText("¿Hace cuánto tiempo fumas")).toBeVisible();

    // Step 2: Select smoking years (5-10 años → value 7)
    await page.getByRole("button", { name: "5-10 años" }).click();

    // Step 3: Should advance to motivation step
    await expect(page.getByText("¿Qué te motiva a dejar de fumar")).toBeVisible();

    // Step 3: Select motivation (Salud → health)
    await page.getByRole("button", { name: "Salud" }).click();

    // Step 4: Should advance to attempts step
    await expect(page.getByText("¿Cuántos intentos previos has tenido")).toBeVisible();

    // Step 4: Select quit attempts (1-2 → value 1)
    await page.getByRole("button", { name: "1-2" }).click();

    // After completing all steps, should redirect to /dashboard
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByRole("heading", { name: /welcome/i })).toBeVisible();
  });
});
