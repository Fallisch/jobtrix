import { test, expect } from "@playwright/test";
import { registerAndLogin, uniqueEmail } from "./helpers/auth";

test.describe("Issue #34 – Berufserfahrungseinträge im Nutzerprofil", () => {
  test("Story: Berufserfahrung hinzufügen -> speichern -> neu laden -> Eintrag vorhanden", async ({
    page,
  }) => {
    await registerAndLogin(page, uniqueEmail("e2e-profile-experience"), "Correct-1");

    await page.goto("/de/profile");

    await page.getByLabel(/^name/i).fill("Erika Musterfrau");

    await page.getByRole("button", { name: /berufserfahrung hinzufügen/i }).click();

    await page.getByPlaceholder("Firma").fill("Acme GmbH");
    await page.getByPlaceholder("Position").fill("Entwickler");
    await page.getByPlaceholder("Zeitraum").fill("01/2020 - 12/2022");
    await page.getByPlaceholder("Aufgaben").fill("Backend-Entwicklung");

    const [response] = await Promise.all([
      page.waitForResponse(
        (res) => res.url().includes("/api/profile") && res.request().method() === "POST"
      ),
      page.getByRole("button", { name: "Speichern" }).click(),
    ]);
    expect(response.ok()).toBe(true);

    await page.reload();

    await expect(page.getByPlaceholder("Firma")).toHaveValue("Acme GmbH");
    await expect(page.getByPlaceholder("Position")).toHaveValue("Entwickler");
    await expect(page.getByPlaceholder("Zeitraum")).toHaveValue("01/2020 - 12/2022");
    await expect(page.getByPlaceholder("Aufgaben")).toHaveValue("Backend-Entwicklung");
  });
});
