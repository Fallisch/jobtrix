import { test, expect } from "@playwright/test";
import { registerAndLogin, uniqueEmail } from "./helpers/auth";

test.describe("Bugfix – Profil-Synchronisierung zwischen /de/profile und /de/generate", () => {
  test("Story: Berufserfahrung im Profil gespeichert -> auf /de/generate generieren -> Berufserfahrung wird an die KI übergeben", async ({
    page,
  }) => {
    await registerAndLogin(page, uniqueEmail("e2e-generate-profile-sync"), "Correct-1");

    // Berufserfahrung über /de/profile anlegen (Postgres-backed via /api/profile)
    await page.goto("/de/profile");
    await page.getByLabel(/^name/i).fill("Erika Musterfrau");

    await page.getByRole("button", { name: /berufserfahrung hinzufügen/i }).click();
    await page.getByPlaceholder("Firma").fill("Acme GmbH");
    await page.getByPlaceholder("Position").fill("Entwicklerin");
    await page.getByPlaceholder("Zeitraum").fill("01/2020 - 12/2022");
    await page.getByPlaceholder("Aufgaben").fill("Backend-Entwicklung");

    const [saveResponse] = await Promise.all([
      page.waitForResponse(
        (res) => res.url().includes("/api/profile") && res.request().method() === "POST"
      ),
      page.getByRole("button", { name: "Speichern" }).click(),
    ]);
    expect(saveResponse.ok()).toBe(true);

    // Ohne lokales Profil im LocalStorage zu /de/generate wechseln
    await page.goto("/de/generate");

    let requestBody: { profile?: { experience?: { company: string; position: string }[] } } = {};
    await page.route("**/api/generate", async (route) => {
      requestBody = route.request().postDataJSON();
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          coverLetter: "Bei der Acme GmbH habe ich als Entwicklerin wertvolle Erfahrung gesammelt.",
          cv: "Erika Musterfrau – Lebenslauf",
          emailSubject: "Bewerbung",
        }),
      });
    });

    await page.getByRole("textbox", { name: /Stellenanzeige/i }).fill("Wir suchen eine Entwicklerin.");

    const generateButton = page.getByRole("button", { name: /Bewerbung generieren/i });
    await expect(generateButton).toBeEnabled();
    await generateButton.click();

    await page.waitForSelector("textarea[aria-label='Anschreiben']");

    expect(requestBody.profile?.experience).toEqual([
      expect.objectContaining({ company: "Acme GmbH", position: "Entwicklerin" }),
    ]);
  });
});
