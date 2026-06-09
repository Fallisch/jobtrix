import { test, expect } from "@playwright/test";

const PROFILE = {
  name: "Max Mustermann",
  address: "Musterstraße 1, 12345 Berlin",
  birthdate: "1990-01-01",
  photo: null,
  education: [{ id: "1", institution: "TU Berlin", degree: "B.Sc. Informatik", year: "2015" }],
  qualifications: ["TypeScript", "React"],
};

const SUBJECT = "Bewerbung als Senior Entwickler – Max Mustermann";
const COVER_LETTER = "Sehr geehrte Damen und Herren, mit großem Interesse bewerbe ich mich auf die ausgeschriebene Stelle.";

test.describe("E-Mail-Entwurf nach der Generierung – QA", () => {
  test.beforeEach(async ({ context, page }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto("/de/generate");
    await page.evaluate((p) => {
      localStorage.setItem("jobtrix_profile", JSON.stringify(p));
    }, PROFILE);
    await page.reload();

    await page.route("**/api/generate", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ emailSubject: SUBJECT, coverLetter: COVER_LETTER, cv: "Max Mustermann – Lebenslauf" }),
      })
    );
    await page.getByRole("textbox", { name: /Stellenanzeige/i }).fill("Wir suchen einen Senior Entwickler.");
    await page.getByRole("button", { name: /Bewerbung generieren/i }).click();
    await expect(page.getByTestId("email-draft-section")).toBeVisible();
  });

  test("User Story 9: E-Mail-Entwurf-Sektion erscheint unterhalb von Anschreiben und Lebenslauf mit Betreffvorschlag und Anschreiben-Text", async ({ page }) => {
    const draft = page.getByTestId("email-draft-section");
    await expect(draft).toBeVisible();
    await expect(draft).toContainText(SUBJECT);
    await expect(draft).toContainText(COVER_LETTER);

    // Reihenfolge: E-Mail-Entwurf erscheint nach Anschreiben- und Lebenslauf-Überschrift
    const headings = await page.getByRole("heading", { level: 2 }).allTextContents();
    expect(headings.indexOf("E-Mail-Entwurf")).toBeGreaterThan(headings.indexOf("Anschreiben"));
    expect(headings.indexOf("E-Mail-Entwurf")).toBeGreaterThan(headings.indexOf("Lebenslauf"));
  });

  test("User Story 9: Betreff in die Zwischenablage kopieren zeigt 'Kopiert ✓' Feedback", async ({ page }) => {
    const draft = page.getByTestId("email-draft-section");
    const copyButton = draft.getByTestId("copy-subject-button");

    await expect(copyButton).toHaveText(/Betreff kopieren/i);
    await copyButton.click();
    await expect(copyButton).toHaveText(/Kopiert ✓/);

    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardText).toBe(SUBJECT);
  });

  test("User Story 9: Anschreiben in die Zwischenablage kopieren zeigt 'Kopiert ✓' Feedback", async ({ page }) => {
    const draft = page.getByTestId("email-draft-section");
    const copyButton = draft.getByTestId("copy-body-button");

    await expect(copyButton).toHaveText(/Anschreiben kopieren/i);
    await copyButton.click();
    await expect(copyButton).toHaveText(/Kopiert ✓/);

    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardText).toBe(COVER_LETTER);
  });
});
