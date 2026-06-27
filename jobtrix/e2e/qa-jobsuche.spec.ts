import { test, expect } from "@playwright/test";
import { registerAndLogin, uniqueEmail } from "./helpers/auth";

const PROFILE = {
  name: "Anna Beispiel",
  address: "Hauptstraße 5, 10115 Berlin",
  birthdate: "1992-03-15",
  photo: null,
  education: [{ id: "1", institution: "HU Berlin", degree: "M.Sc.", year: "2018" }],
  qualifications: ["Python", "SQL"],
  interests: ["Datenanalyse"],
};

const MOCK_GENERATE_RESULT = {
  coverLetter: "Sehr geehrte Damen und Herren",
  cv: "Anna Beispiel – Lebenslauf",
  emailSubject: "Bewerbung",
};

const JOB_RESULTS = {
  results: [
    {
      title: "Softwareentwickler (m/w/d)",
      company: "Acme GmbH",
      location: "Berlin",
      description: "Wir suchen einen Softwareentwickler für unser Team in Berlin.",
      url: "https://www.arbeitsagentur.de/jobsuche/jobdetail/10000-123",
    },
    {
      title: "Frontend Developer",
      company: "External GmbH",
      location: "Hamburg",
      description: null,
      url: "https://example.com/job/456",
    },
  ],
};

test.describe("Issue #44 – Jobsuche über Arbeitsagentur-API", () => {
  test.beforeEach(async ({ page }) => {
    await registerAndLogin(page, uniqueEmail("e2e-jobsuche"), "Correct-1");
    await page.goto("/de/generate");
    await page.evaluate((p) => {
      localStorage.setItem("jobtrix_profile", JSON.stringify(p));
    }, PROFILE);
    await page.reload();
  });

  test("AC: Stelle suchen zeigt Trefferliste, Klick übernimmt Beschreibung ins Feld 'Stellenanzeige'", async ({ page }) => {
    await page.route("**/api/jobsuche**", (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(JOB_RESULTS) })
    );

    await page.getByRole("textbox", { name: "Berufsfeld" }).fill("Softwareentwickler");
    await page.getByRole("textbox", { name: "Ort" }).fill("Berlin");
    await page.getByRole("button", { name: "Suchen" }).click();

    await expect(page.getByText("Softwareentwickler (m/w/d)")).toBeVisible();
    await expect(page.getByText(/Acme GmbH/)).toBeVisible();
    await expect(page.getByRole("link", { name: "Original ansehen" }).first()).toHaveAttribute(
      "href",
      "https://www.arbeitsagentur.de/jobsuche/jobdetail/10000-123"
    );

    await page.getByText("Softwareentwickler (m/w/d)").click();

    await expect(page.getByRole("textbox", { name: "Stellenanzeige" })).toHaveValue(
      "Wir suchen einen Softwareentwickler für unser Team in Berlin."
    );
  });

  test("AC: Umkreis-Auswahl hat Standardwert 25 km und gewählter Wert wird an die Jobsuche übergeben", async ({ page }) => {
    let requestedUrl = "";
    await page.route("**/api/jobsuche**", (route) => {
      requestedUrl = route.request().url();
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(JOB_RESULTS) });
    });

    await expect(page.getByRole("combobox", { name: "Umkreis (km)" })).toHaveValue("25");

    await page.getByRole("combobox", { name: "Umkreis (km)" }).selectOption("50");
    await page.getByRole("textbox", { name: "Berufsfeld" }).fill("Softwareentwickler");
    await page.getByRole("button", { name: "Suchen" }).click();

    await expect(page.getByText("Softwareentwickler (m/w/d)")).toBeVisible();
    expect(requestedUrl).toContain("umkreis=50");
  });

  test("AC: externer Treffer – Server holt den Anzeigentext und füllt das Feld 'Stellenanzeige'", async ({ page }) => {
    await page.route("**/api/jobsuche**", (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(JOB_RESULTS) })
    );
    // Spezifischer (später registriert → Vorrang für /extract): erfolgreiche Server-Übernahme.
    await page.route("**/api/jobsuche/extract**", (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ text: "Vom Server geholter Anzeigentext." }) })
    );

    await page.getByRole("textbox", { name: "Berufsfeld" }).fill("Frontend");
    await page.getByRole("button", { name: "Suchen" }).click();
    await expect(page.getByText("Frontend Developer")).toBeVisible();

    await page.getByText("Frontend Developer").click();

    await expect(page.getByRole("textbox", { name: "Stellenanzeige" })).toHaveValue(
      "Vom Server geholter Anzeigentext."
    );
  });

  test("AC: externer Treffer – scheitert der Server-Abruf, öffnet sich die Originalanzeige + ein Einfügefeld", async ({ page, context }) => {
    await page.route("**/api/jobsuche**", (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(JOB_RESULTS) })
    );
    // Server kann den Text nicht holen → Fallback (text:null).
    await page.route("**/api/jobsuche/extract**", (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ text: null }) })
    );

    await page.getByRole("textbox", { name: "Berufsfeld" }).fill("Frontend");
    await page.getByRole("button", { name: "Suchen" }).click();

    await expect(page.getByText("Frontend Developer")).toBeVisible();

    const [newPage] = await Promise.all([
      context.waitForEvent("page"),
      page.getByText("Frontend Developer").click(),
    ]);
    await newPage.waitForLoadState();
    expect(newPage.url()).toBe("https://example.com/job/456");
    await newPage.close();

    // Feld bleibt leer, dafür erscheint das Einfügefeld als Fallback.
    await expect(page.getByRole("textbox", { name: "Stellenanzeige" })).toHaveValue("");
    await expect(page.getByTestId("external-paste-field")).toBeVisible();
  });

  test("AC: leere Trefferliste zeigt 'Keine Treffer gefunden.' ohne technischen Fehlerhinweis", async ({ page }) => {
    await page.route("**/api/jobsuche**", (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ results: [] }) })
    );

    await page.getByRole("textbox", { name: "Berufsfeld" }).fill("Astronaut");
    await page.getByRole("button", { name: "Suchen" }).click();

    await expect(page.getByText("Keine Treffer gefunden.")).toBeVisible();
    await expect(page.getByText("Generierung fehlgeschlagen. Bitte versuche es erneut.")).not.toBeVisible();
  });

  test("AC: manuelles Einfügen in 'Stellenanzeige' und Generieren funktionieren nach Jobsuche unverändert", async ({ page }) => {
    await page.route("**/api/jobsuche**", (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ results: [] }) })
    );
    await page.route("**/api/generate", (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(MOCK_GENERATE_RESULT) })
    );

    await page.getByRole("button", { name: "Suchen" }).click();
    await expect(page.getByText("Keine Treffer gefunden.")).toBeVisible();

    await page.getByRole("textbox", { name: "Stellenanzeige" }).fill("Wir suchen eine Entwicklerin.");
    await page.getByRole("button", { name: /Bewerbung generieren/i }).click();

    await expect(page.locator("textarea").nth(1)).toHaveValue("Sehr geehrte Damen und Herren");
  });
});
