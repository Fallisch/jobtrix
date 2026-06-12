import { test, expect } from "@playwright/test";
import { registerAndLogin, uniqueEmail } from "./helpers/auth";

const PROFILE_OLD_FORMAT = {
  name: "Anna Beispiel",
  address: "Hauptstraße 5, 10115 Berlin",
  email: "anna@example.de",
  phone: "0151 12345678",
  birthdate: "1992-03-15",
  photo: null,
  education: [{ id: "1", institution: "HU Berlin", degree: "M.Sc.", year: "2018" }],
  qualifications: ["Python", "SQL"],
  interests: ["Datenanalyse"],
};

test.describe("Skill-Balken individuell anpassbar – QA (Issue #12)", () => {
  test.beforeEach(async ({ page }) => {
    await registerAndLogin(page, uniqueEmail("e2e-skill-slider"), "correct-password");
  });

  test("Slider erscheint nach Hinzufügen einer Qualifikation", async ({ page }) => {
    await page.goto("/de/profile");

    await page.getByPlaceholder(/TypeScript/i).fill("Kommunikation");
    await page.getByRole("button", { name: /^Hinzufügen$/i }).click();

    const slider = page.getByRole("slider", { name: /Kommunikation/i });
    await expect(slider).toBeVisible();
    await expect(slider).toHaveValue("60");

    await page.screenshot({ path: "docs/qa-skill-slider-form.png", fullPage: false });
  });

  test("Slider-Wert wird gespeichert und korrekt geladen", async ({ page }) => {
    await page.goto("/de/profile");

    await page.getByPlaceholder(/TypeScript/i).fill("Projektmanagement");
    await page.getByRole("button", { name: /^Hinzufügen$/i }).click();

    const slider = page.getByRole("slider", { name: /Projektmanagement/i });
    await slider.fill("80");
    await expect(slider).toHaveValue("80");

    await expect(page.getByText("80%")).toBeVisible();
  });

  // Seit der DB-Migration des Profils (#19) liest /de/profile nicht mehr aus localStorage,
  // daher greift diese Migration auf der Profilseite nicht mehr. Separat als Issue erfasst.
  test.fixme("Altes Profil (String-Format) wird ohne Datenverlust auf 60% migriert", async ({ page }) => {
    await page.goto("/de/profile");
    await page.evaluate((p) => {
      localStorage.setItem("jobtrix_profile", JSON.stringify(p));
    }, PROFILE_OLD_FORMAT);
    await page.reload();

    const slider = page.getByRole("slider", { name: /Python/i });
    await expect(slider).toBeVisible();
    await expect(slider).toHaveValue("60");

    await page.screenshot({ path: "docs/qa-skill-slider-migration.png", fullPage: false });
  });

  test("Profil mit individuellen Skill-Werten wird korrekt gespeichert", async ({ page }) => {
    await page.goto("/de/profile");

    await page.getByPlaceholder(/TypeScript/i).fill("Python");
    await page.getByRole("button", { name: /^Hinzufügen$/i }).click();

    const slider = page.getByRole("slider", { name: /Python/i });
    await slider.fill("80");

    await page.getByPlaceholder(/Fotografie/i).fill("Lesen");
    await page.getByRole("button", { name: /Interesse hinzufügen/i }).click();
    const interestSlider = page.getByRole("slider", { name: /Lesen/i });
    await interestSlider.fill("40");

    await page.getByRole("textbox", { name: /Name/i }).fill("Test User");
    await page.getByPlaceholder(/Institution/i).fill("TU Berlin");
    await page.getByRole("button", { name: /Speichern/i }).click();
    await page.waitForURL("**/de");

    const res = await page.request.get("/api/profile");
    const saved = await res.json();

    expect(saved?.qualifications).toContainEqual({ label: "Python", value: 80 });
    expect(saved?.interests).toContainEqual({ label: "Lesen", value: 40 });

    await page.screenshot({ path: "docs/qa-skill-slider-pdf.png", fullPage: false });
  });
});
