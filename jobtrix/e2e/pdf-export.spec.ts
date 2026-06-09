import { test, expect } from "@playwright/test";

const PROFILE = {
  name: "Lena Testmann",
  address: "Teststraße 42, 10115 Berlin",
  birthdate: "1995-06-15",
  photo: null,
  education: [{ id: "1", institution: "FU Berlin", degree: "B.Sc. Informatik", year: "2019" }],
  qualifications: ["TypeScript", "React", "Node.js"],
  interests: ["Open Source", "UX Design"],
};

const MOCK_COVER_LETTER = "Sehr geehrte Damen und Herren,\n\nmit großem Interesse bewerbe ich mich auf die ausgeschriebene Stelle.";
const MOCK_CV = "Lena Testmann\n\nAUSBILDUNG\nB.Sc. Informatik, FU Berlin, 2019\n\nKENNTNISSE\nTypeScript, React, Node.js";

test.describe("PDF-Export – vollständiger Bewerbungsflow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/de/generate");
    await page.evaluate((p) => {
      localStorage.setItem("jobtrix_profile", JSON.stringify(p));
    }, PROFILE);
    await page.reload();
  });

  test("AC: Anschreiben- und Lebenslauf-PDF-Buttons erscheinen nach Generierung", async ({ page }) => {
    await page.route("**/api/generate", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ coverLetter: MOCK_COVER_LETTER, cv: MOCK_CV, emailSubject: "Bewerbung" }),
      })
    );

    await page.getByRole("textbox", { name: /Stellenanzeige/i }).fill("Wir suchen eine TypeScript-Entwicklerin.");
    await page.getByRole("button", { name: /Bewerbung generieren/i }).click();
    await page.waitForSelector("textarea[aria-label='Anschreiben']");

    await expect(page.getByRole("button", { name: /Anschreiben als PDF/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Lebenslauf als PDF/i })).toBeVisible();
  });

  test("AC: Bearbeiteter Text bleibt bis zum Download erhalten", async ({ page }) => {
    await page.route("**/api/generate", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ coverLetter: MOCK_COVER_LETTER, cv: MOCK_CV, emailSubject: "Bewerbung" }),
      })
    );

    await page.getByRole("textbox", { name: /Stellenanzeige/i }).fill("Wir suchen eine Entwicklerin.");
    await page.getByRole("button", { name: /Bewerbung generieren/i }).click();

    const coverLetterArea = page.getByRole("textbox", { name: /^Anschreiben$/i });
    await coverLetterArea.waitFor();
    await coverLetterArea.fill("Mein individuell angepasstes Anschreiben für diese Stelle.");

    await expect(coverLetterArea).toHaveValue("Mein individuell angepasstes Anschreiben für diese Stelle.");

    await expect(page.getByRole("button", { name: /Anschreiben als PDF/i })).toBeVisible();
  });

  test("AC: Anschreiben-PDF-Download wird ausgelöst (kein Server-Roundtrip)", async ({ page }) => {
    await page.route("**/api/generate", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ coverLetter: MOCK_COVER_LETTER, cv: MOCK_CV, emailSubject: "Bewerbung" }),
      })
    );

    const apiRequests: string[] = [];
    page.on("request", (req) => {
      if (req.url().includes("/api/")) apiRequests.push(req.url());
    });

    await page.getByRole("textbox", { name: /Stellenanzeige/i }).fill("Stelle");
    await page.getByRole("button", { name: /Bewerbung generieren/i }).click();
    await page.waitForSelector("textarea[aria-label='Anschreiben']");

    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: /Anschreiben als PDF/i }).click(),
    ]);

    expect(download.suggestedFilename()).toBe("anschreiben.pdf");

    // nur ein API-Request (generate), kein zweiter für PDF
    const pdfApiCalls = apiRequests.filter((url) => url.includes("/api/") && !url.includes("/api/generate"));
    expect(pdfApiCalls).toHaveLength(0);
  });

  test("AC: Lebenslauf-PDF-Download wird ausgelöst", async ({ page }) => {
    await page.route("**/api/generate", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ coverLetter: MOCK_COVER_LETTER, cv: MOCK_CV, emailSubject: "Bewerbung" }),
      })
    );

    await page.getByRole("textbox", { name: /Stellenanzeige/i }).fill("Stelle");
    await page.getByRole("button", { name: /Bewerbung generieren/i }).click();
    await page.waitForSelector("textarea[aria-label='Anschreiben']");

    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: /Lebenslauf als PDF/i }).click(),
    ]);

    expect(download.suggestedFilename()).toBe("lebenslauf.pdf");
  });

  test("Vollständiger Flow: Profil → Stelle → Generieren → Bearbeiten → PDF herunterladen", async ({ page }) => {
    await page.route("**/api/generate", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ coverLetter: MOCK_COVER_LETTER, cv: MOCK_CV, emailSubject: "Bewerbung als Entwicklerin" }),
      })
    );

    // Stelle eingeben und generieren
    await page.getByRole("textbox", { name: /Stellenanzeige/i }).fill("Wir suchen eine erfahrene TypeScript-Entwicklerin.");
    await page.getByRole("button", { name: /Bewerbung generieren/i }).click();
    await page.waitForSelector("textarea[aria-label='Anschreiben']");

    // Text bearbeiten
    const coverLetterArea = page.getByRole("textbox", { name: /^Anschreiben$/i });
    await coverLetterArea.fill("Individuell überarbeitetes Anschreiben für genau diese Stelle.");

    // PDF herunterladen
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: /Anschreiben als PDF/i }).click(),
    ]);

    expect(download.suggestedFilename()).toBe("anschreiben.pdf");
    expect(download.suggestedFilename()).toMatch(/\.pdf$/);
  });
});
