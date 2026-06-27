import { test, expect } from "@playwright/test";
import { uniqueEmail } from "./helpers/auth";

test.describe("Issue #40 – Dark Mode: Theming-Infrastruktur, Umschalter & Persistenz", () => {
  test("Story: Erstbesuch ohne gespeichertes Theme übernimmt die Geräte-Systemeinstellung (Dark)", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto("/de");

    await expect(page.locator("html")).toHaveClass(/dark/);
  });

  test("Story: Umschalter im Header wechselt Hell/Dunkel mit Transition und bleibt nach Reload erhalten", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/de");

    await expect(page.locator("html")).not.toHaveClass(/dark/);

    const lightBackground = await page.evaluate(
      () => getComputedStyle(document.body).backgroundColor
    );

    await page.getByRole("button", { name: "Zu Dunkelmodus wechseln" }).click();

    await expect(page.locator("html")).toHaveClass(/dark/);

    const transitionDuration = await page.evaluate(
      () => getComputedStyle(document.body).transitionDuration
    );
    const firstDuration = parseFloat(transitionDuration.split(",")[0]);
    expect(firstDuration).toBeGreaterThan(0);
    expect(firstDuration).toBeLessThan(0.3);

    // Transition abwarten, bevor der neue Farbwert gelesen wird.
    await page.waitForTimeout(300);

    const darkBackground = await page.evaluate(
      () => getComputedStyle(document.body).backgroundColor
    );
    expect(darkBackground).not.toBe(lightBackground);

    await page.reload();
    await expect(page.locator("html")).toHaveClass(/dark/);
  });

  test("Story: Manuelles Umschalten wird angemeldet im Nutzerkonto gespeichert und nach erneutem Login geräteübergreifend angewendet", async ({ browser }) => {
    const email = uniqueEmail("e2e-dark-mode");
    const password = "Correct-1";

    const contextA = await browser.newContext({ colorScheme: "light" });
    const pageA = await contextA.newPage();

    await pageA.goto("/de/register");
    await pageA.waitForLoadState("networkidle");
    await pageA.getByLabel("E-Mail").fill(email);
    await pageA.getByLabel("Passwort", { exact: true }).fill(password);
    await pageA.getByLabel("Passwort bestätigen").fill(password);
    await pageA.getByLabel(/AGB und die Datenschutzbestimmungen/).check();
    await pageA.getByRole("button", { name: "Registrieren" }).click();
    await expect(pageA).toHaveURL(/\/de\/onboarding/);

    await expect(pageA.locator("html")).not.toHaveClass(/dark/);
    await Promise.all([
      pageA.waitForResponse(
        (res) => res.url().includes("/api/theme") && res.request().method() === "POST"
      ),
      pageA.getByRole("button", { name: "Zu Dunkelmodus wechseln" }).click(),
    ]);
    await expect(pageA.locator("html")).toHaveClass(/dark/);

    await pageA.getByRole("button", { name: "Abmelden" }).click();
    await contextA.close();

    const contextB = await browser.newContext({ colorScheme: "light" });
    const pageB = await contextB.newPage();

    await pageB.goto("/de/login");
    await pageB.waitForLoadState("networkidle");
    await pageB.getByLabel("E-Mail").fill(email);
    await pageB.getByLabel("Passwort").fill(password);
    await pageB.getByRole("button", { name: "Anmelden" }).click();
    await expect(pageB).toHaveURL(/\/de\/onboarding/);

    await expect(pageB.locator("html")).toHaveClass(/dark/);

    await contextB.close();
  });
});
