import { test, expect } from "@playwright/test";

const PROFILE = {
  name: "Max Mustermann",
  address: "Musterstraße 1, 12345 Berlin",
  birthdate: "1990-01-01",
  photo: null,
  education: [{ id: "1", institution: "TU Berlin", degree: "B.Sc. Informatik", year: "2015" }],
  qualifications: ["TypeScript", "React"],
};

test.describe("Issue #20 – Free Trial, Zugangskontrolle & Pricing", () => {
  test.beforeEach(async ({ page }) => {
    const email = `e2e-pricing-${Date.now()}@example.com`;
    const password = "Correct-1";

    await page.goto("/de/register");
    await page.getByLabel("E-Mail").fill(email);
    await page.getByLabel("Passwort", { exact: true }).fill(password);
    await page.getByLabel("Passwort bestätigen").fill(password);
    await page.getByLabel(/AGB und die Datenschutzbestimmungen/).check();
    await page.getByRole("button", { name: "Registrieren" }).click();
    await expect(page).toHaveURL(/\/de\/onboarding/);

    await page.goto("/de/generate");
    await page.evaluate((p) => {
      localStorage.setItem("jobtrix_profile", JSON.stringify(p));
    }, PROFILE);
    await page.reload();
  });

  test("erste Generierung gelingt kostenlos, zweite leitet zu /pricing, Klick auf Paket leitet zu Stripe Checkout weiter", async ({ page }) => {
    await page.route("**/api/generate", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ coverLetter: "Anschreiben Text", cv: "Lebenslauf Text", emailSubject: "Bewerbung" }),
      })
    );
    await page.getByRole("textbox", { name: /Stellenanzeige/i }).fill("Wir suchen einen Entwickler.");
    await page.getByRole("button", { name: /Bewerbung generieren/i }).click();
    await expect(page.locator("textarea").nth(1)).toHaveValue("Anschreiben Text");

    await page.route("**/api/generate", (route) =>
      route.fulfill({
        status: 402,
        contentType: "application/json",
        body: JSON.stringify({ error: "access_required" }),
      })
    );
    await page.getByRole("button", { name: /Bewerbung generieren/i }).click();
    await expect(page).toHaveURL(/\/de\/pricing/);
    await expect(page.getByRole("heading", { name: "Zugang zu JobTRIX" })).toBeVisible();

    await page.route("https://checkout.stripe.com/**", (route) =>
      route.fulfill({ status: 200, contentType: "text/html", body: "<html><body>Stripe Checkout (Test)</body></html>" })
    );
    await page.route("**/api/checkout", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ url: "https://checkout.stripe.com/test-session-e2e" }),
      })
    );

    await page.getByRole("button", { name: "Jetzt kaufen" }).last().click();
    await page.waitForURL("https://checkout.stripe.com/test-session-e2e");
  });
});
