import { test, expect, Page } from "@playwright/test";
import { registerAndLogin, uniqueEmail } from "./helpers/auth";
import { prisma } from "../lib/prisma";

const PROFILE = {
  name: "Anna Beispiel",
  address: "Hauptstraße 5, 10115 Berlin",
  email: "anna@example.com",
  phone: "0151 1234567",
  birthdate: "1992-03-15",
  photo: null,
  education: [{ id: "1", institution: "HU Berlin", degree: "M.Sc.", year: "2018" }],
  experience: [],
  qualifications: [{ label: "Python", value: 80 }],
  interests: [{ label: "Datenanalyse", value: 60 }],
};

const MOCK_RESULT = {
  coverLetter: "Sehr geehrte Damen und Herren, ich bewerbe mich um die ausgeschriebene Stelle.",
  cv: "Anna Beispiel – Lebenslauf",
  emailSubject: "Bewerbung als Entwicklerin",
};

function parseRgb(value: string): [number, number, number] {
  const match = value.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) throw new Error(`Unerwartetes Farbformat: ${value}`);
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

function relativeLuminance([r, g, b]: [number, number, number]): number {
  const channel = (c: number) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrastRatio(colorA: string, colorB: string): number {
  const la = relativeLuminance(parseRgb(colorA));
  const lb = relativeLuminance(parseRgb(colorB));
  const lighter = Math.max(la, lb);
  const darker = Math.min(la, lb);
  return (lighter + 0.05) / (darker + 0.05);
}

const MIN_CONTRAST = 4.5;

async function colorsOf(page: Page, selector: string): Promise<{ color: string; backgroundColor: string }> {
  return page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) throw new Error(`Element nicht gefunden: ${sel}`);
    const color = getComputedStyle(el).color;
    let bgEl: Element | null = el;
    let backgroundColor = getComputedStyle(bgEl).backgroundColor;
    while (backgroundColor === "rgba(0, 0, 0, 0)" && bgEl.parentElement) {
      bgEl = bgEl.parentElement;
      backgroundColor = getComputedStyle(bgEl).backgroundColor;
    }
    return { color, backgroundColor };
  }, selector);
}

test.describe("Issue #41 – Dark Mode: Hauptseiten (Profil, Generierung, Bewerbungshistorie)", () => {
  test.afterAll(async () => {
    await prisma.$disconnect();
  });

  test("Story: /profile zeigt im Dark Mode kontrastreiche Karten, Formularfelder und Texte", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await registerAndLogin(page, uniqueEmail("e2e-dark-profile"), "Correct-1");
    await expect(page.locator("html")).toHaveClass(/dark/);

    await page.goto("/de/profile");
    await page.waitForLoadState("networkidle");

    const { color: headingColor, backgroundColor: pageBg } = await colorsOf(page, "h1");
    expect(contrastRatio(headingColor, pageBg)).toBeGreaterThanOrEqual(MIN_CONTRAST);

    await expect(page.locator("#name")).toBeVisible();
    const { color: inputColor, backgroundColor: inputBg } = await colorsOf(page, "#name");
    expect(inputBg).not.toBe("rgb(255, 255, 255)");
    expect(contrastRatio(inputColor, inputBg)).toBeGreaterThanOrEqual(MIN_CONTRAST);
  });

  test("Story: /generate inkl. Layout-Auswahl und Akzentfarben-Palette ist im Dark Mode kontrastreich", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    await registerAndLogin(page, uniqueEmail("e2e-dark-generate"), "Correct-1");
    await expect(page.locator("html")).toHaveClass(/dark/);

    await page.goto("/de/generate");
    await page.evaluate((p) => {
      localStorage.setItem("jobtrix_profile", JSON.stringify(p));
    }, PROFILE);
    await page.reload();
    await page.getByRole("heading", { level: 1 }).waitFor();

    const { color: headingColor, backgroundColor: pageBg } = await colorsOf(page, "h1");
    expect(contrastRatio(headingColor, pageBg)).toBeGreaterThanOrEqual(MIN_CONTRAST);

    const { backgroundColor: textareaBg } = await colorsOf(page, "#jobPosting");
    expect(textareaBg).not.toBe("rgb(255, 255, 255)");

    await page.route("**/api/generate", (route) =>
      route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(MOCK_RESULT) })
    );
    await page.getByRole("textbox", { name: /Stellenanzeige/i }).fill("Wir suchen eine Entwicklerin.");
    await page.getByRole("button", { name: /Bewerbung generieren/i }).click();
    await expect(page.locator("textarea").nth(1)).toHaveValue(MOCK_RESULT.coverLetter, { timeout: 10000 });

    const templateSection = page.getByText("Layout:").locator("xpath=..");
    await templateSection.getByRole("button", { name: "Akzent", exact: true }).click();

    const palette = page.getByTestId("color-palette");
    await expect(palette).toBeVisible();
    await expect(palette.getByRole("button").first()).toBeVisible();

    const section = page.locator("section").first();
    const sectionBg = await section.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(sectionBg).not.toBe("rgb(255, 255, 255)");

    const { color: sectionHeadingColor } = await colorsOf(page, "section h2");
    expect(contrastRatio(sectionHeadingColor, sectionBg)).toBeGreaterThanOrEqual(MIN_CONTRAST);
  });

  test("Story: /application-history zeigt Einträge im Dark Mode kontrastreich", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    const userId = await registerAndLogin(page, uniqueEmail("e2e-dark-history"), "Correct-1");
    await expect(page.locator("html")).toHaveClass(/dark/);

    await prisma.applicationHistoryEntry.create({
      data: {
        userId,
        jobTitle: "Frontend Entwicklerin",
        companyName: "Beta GmbH",
        emailSubject: "Bewerbung als Frontend Entwicklerin",
        coverLetter: "Sehr geehrte Damen und Herren, Anschreiben-Inhalt",
        cv: "Lebenslauf-Inhalt",
        profileSnapshot: PROFILE,
      },
    });

    await page.goto("/de/application-history");
    await page.waitForLoadState("networkidle");

    const { color: headingColor, backgroundColor: pageBg } = await colorsOf(page, "h1");
    expect(contrastRatio(headingColor, pageBg)).toBeGreaterThanOrEqual(MIN_CONTRAST);

    const { backgroundColor: cardBg } = await colorsOf(page, "h2");
    expect(cardBg).not.toBe("rgb(255, 255, 255)");

    const { color: entryHeadingColor } = await colorsOf(page, "h2");
    expect(contrastRatio(entryHeadingColor, cardBg)).toBeGreaterThanOrEqual(MIN_CONTRAST);
  });

  test("Story: /application-history/[id] zeigt Detailansicht mit Tabs im Dark Mode kontrastreich", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    const userId = await registerAndLogin(page, uniqueEmail("e2e-dark-detail"), "Correct-1");

    const entry = await prisma.applicationHistoryEntry.create({
      data: {
        userId,
        jobTitle: "Backend Entwickler",
        companyName: "Gamma GmbH",
        emailSubject: "Bewerbung als Backend Entwickler",
        coverLetter: "Anschreiben-Inhalt",
        cv: "Lebenslauf-Inhalt",
        profileSnapshot: PROFILE,
      },
    });

    await page.goto(`/de/application-history/${entry.id}`);
    await page.waitForLoadState("networkidle");

    const { color: headingColor, backgroundColor: pageBg } = await colorsOf(page, "h1");
    expect(contrastRatio(headingColor, pageBg)).toBeGreaterThanOrEqual(MIN_CONTRAST);

    const { backgroundColor: sectionBg } = await colorsOf(page, "section");
    expect(sectionBg).not.toBe("rgb(255, 255, 255)");
    const { color: sectionHeadingColor } = await colorsOf(page, "section h2");
    expect(contrastRatio(sectionHeadingColor, sectionBg)).toBeGreaterThanOrEqual(MIN_CONTRAST);

    await page.getByRole("tab", { name: "Lebenslauf" }).click();
    await expect(page.getByText("Lebenslauf-Inhalt")).toBeVisible();
    const { backgroundColor: cvSectionBg } = await colorsOf(page, "section");
    expect(cvSectionBg).not.toBe("rgb(255, 255, 255)");
  });
});
