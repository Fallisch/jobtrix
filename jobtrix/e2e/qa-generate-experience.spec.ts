import { test, expect } from "@playwright/test";
import { registerAndLogin, uniqueEmail } from "./helpers/auth";

const PROFILE = {
  name: "Max Mustermann",
  address: "Musterstraße 1, 12345 Berlin",
  birthdate: "1990-01-01",
  photo: null,
  education: [{ id: "1", institution: "TU Berlin", degree: "B.Sc. Informatik", year: "2015" }],
  experience: [
    {
      id: "1",
      company: "Acme GmbH",
      position: "Entwickler",
      period: "01/2020 - 12/2022",
      tasks: "Backend-Entwicklung",
    },
  ],
  qualifications: [{ label: "TypeScript", value: 80 }],
  interests: [],
};

test.describe("Issue #35 – Berufserfahrung in KI-Generierungs-Prompt", () => {
  test("Story: Profil mit Berufserfahrung -> Bewerbung generieren -> Anschreiben referenziert Firma/Position aus der Berufserfahrung", async ({
    page,
  }) => {
    await registerAndLogin(page, uniqueEmail("e2e-generate-experience"), "correct-password");

    await page.goto("/de/generate");
    await page.evaluate((p) => {
      localStorage.setItem("jobtrix_profile", JSON.stringify(p));
    }, PROFILE);
    await page.reload();

    let requestBody: { profile?: { experience?: { company: string; position: string }[] } } = {};
    await page.route("**/api/generate", async (route) => {
      requestBody = route.request().postDataJSON();
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          coverLetter: "Bei der Acme GmbH habe ich als Entwickler wertvolle Erfahrung gesammelt.",
          cv: "Max Mustermann – Lebenslauf",
        }),
      });
    });

    await page.getByRole("textbox", { name: /Stellenanzeige/i }).fill("Wir suchen einen Entwickler.");
    await page.getByRole("button", { name: /Bewerbung generieren/i }).click();

    // textarea index: 0 = Stellenanzeige, 1 = Anschreiben
    await expect(page.locator("textarea").nth(1)).toHaveValue(/Acme GmbH.*Entwickler/);

    expect(requestBody.profile?.experience).toEqual([
      expect.objectContaining({ company: "Acme GmbH", position: "Entwickler" }),
    ]);
  });
});
