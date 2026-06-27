import { test, expect } from "@playwright/test";

test.describe("Issue #61 – Marketing-Landingpage: alle fünf Abschnitte sichtbar", () => {
  test("Abschnitt 'Wie es funktioniert' zeigt drei nummerierte Schritte", async ({ page }) => {
    await page.goto("/de");
    await page.waitForLoadState("networkidle");
    const section = page.getByTestId("how-it-works");
    await expect(section).toBeVisible();
    await expect(section.getByTestId("step")).toHaveCount(3);
  });

  test("Abschnitt 'Features' zeigt mindestens vier Kacheln", async ({ page }) => {
    await page.goto("/de");
    await page.waitForLoadState("networkidle");
    const section = page.getByTestId("features");
    await expect(section).toBeVisible();
    const tiles = section.getByTestId("feature-tile");
    await expect(tiles).toHaveCount(4);
  });

  test("Preise-Teaser ist sichtbar und enthält Link zur Preisseite", async ({ page }) => {
    await page.goto("/de");
    await page.waitForLoadState("networkidle");
    const section = page.getByTestId("pricing-teaser");
    await expect(section).toBeVisible();
    await expect(section.getByRole("link", { name: /preis/i })).toHaveAttribute("href", /\/pricing/);
  });

  test("Abschluss-CTA am Seitenende hat Registrierungs-Button", async ({ page }) => {
    await page.goto("/de");
    await page.waitForLoadState("networkidle");
    const section = page.getByTestId("final-cta");
    await expect(section).toBeVisible();
    await expect(section.getByRole("link", { name: /registrier/i })).toHaveAttribute("href", /\/register/);
  });

  test("Englische Landingpage – alle vier neuen Abschnitte vorhanden", async ({ page }) => {
    await page.goto("/en");
    await page.waitForLoadState("networkidle");
    await expect(page.getByTestId("how-it-works")).toBeVisible();
    await expect(page.getByTestId("features")).toBeVisible();
    await expect(page.getByTestId("pricing-teaser")).toBeVisible();
    await expect(page.getByTestId("final-cta")).toBeVisible();
  });
});

test.describe("Issue #59 – Marketing-Landingpage: Hero und kein Redirect", () => {
  test("Besucher ohne Login bleibt auf /de – kein Redirect auf /profile oder /login", async ({ page }) => {
    await page.goto("/de");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL(/^http:\/\/localhost:\d+\/de\/?$/);
  });

  test("Hero: h1 und CTA-Button mit Link auf /register sichtbar", async ({ page }) => {
    await page.goto("/de");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL(/^http:\/\/localhost:\d+\/de\/?$/);
    const hero = page.getByTestId("hero");
    await expect(hero.getByRole("heading", { level: 1 })).toBeVisible();
    const heroCta = hero.getByRole("link").first();
    await expect(heroCta).toBeVisible();
    await expect(heroCta).toHaveAttribute("href", /\/register/);
  });

  test("Englische Landingpage – keine Weiterleitung, Überschrift sichtbar", async ({ page }) => {
    await page.goto("/en");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL(/^http:\/\/localhost:\d+\/en\/?$/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
});
