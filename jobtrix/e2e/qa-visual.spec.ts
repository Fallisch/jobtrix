import { test, expect } from "@playwright/test";
import * as path from "path";
import * as fs from "fs";

const QA_DIR = path.join(__dirname, "../docs");

test.describe("QA Visual – User Stories 11, 12, 13", () => {
  test.beforeAll(() => {
    if (!fs.existsSync(QA_DIR)) fs.mkdirSync(QA_DIR, { recursive: true });
  });

  test("Story 13: Professionelles Design – Header und Layout korrekt", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.screenshot({ path: path.join(QA_DIR, "qa-desktop.png"), fullPage: true });

    // Header mit korrekter Farbe und Text
    const header = page.getByRole("banner");
    await expect(header).toBeVisible();
    await expect(page.getByText("JobTRIX")).toBeVisible();
    await expect(page).toHaveTitle("JobTRIX");
  });

  test("Story 12: App lädt schnell (unter 3 Sekunden)", async ({ page }) => {
    const start = Date.now();
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    const loadMs = Date.now() - start;
    console.log(`Ladezeit: ${loadMs}ms`);
    expect(loadMs).toBeLessThan(3000);
  });

  test("Story 11: PWA manifest installierbar konfiguriert", async ({ page }) => {
    const resp = await page.goto("/manifest.json");
    expect(resp?.status()).toBe(200);
    const manifest = await resp?.json();
    expect(manifest.name).toBe("JobTRIX");
    expect(manifest.display).toBe("standalone");
    expect(manifest.theme_color).toBe("#1E3A5F");
    expect(manifest.icons).toHaveLength(2);
  });

  test("Story 11: Mobile-Ansicht – App nutzbar auf Smartphone", async ({ browser }) => {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.screenshot({ path: path.join(QA_DIR, "qa-mobile.png"), fullPage: true });

    await expect(page.getByRole("banner")).toBeVisible();
    await expect(page.getByText("JobTRIX")).toBeVisible();
  });
});
