import { test, expect } from "@playwright/test";
import { registerAndLogin, uniqueEmail } from "./helpers/auth";
import * as fs from "fs";
import * as zlib from "zlib";

const PROFILE_OLD_FORMAT = {
  name: "Anna Beispiel",
  address: "Hauptstraße 5, 10115 Berlin",
  email: "anna@example.de",
  phone: "0151 12345678",
  birthdate: "1992-03-15",
  photo: null,
  education: [{ id: "1", institution: "HU Berlin", degree: "M.Sc.", year: "2018" }],
  qualifications: ["Python", "SQL"],
  strengths: ["Datenanalyse"],
};

// @react-pdf/renderer schreibt Text als Hex-codierte Helvetica-Zeichen in
// Flate-komprimierten Content-Streams. Zum Prüfen des PDF-Inhalts werden
// alle Streams dekomprimiert und Hex-Strings in Zeichen zurückübersetzt.
function decodePdfStreams(buf: Buffer): string {
  const streamRe = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
  let content = "";
  let match: RegExpExecArray | null;
  while ((match = streamRe.exec(buf.toString("latin1"))) !== null) {
    try {
      content += zlib.inflateSync(Buffer.from(match[1], "latin1")).toString("latin1");
    } catch {
      // kein Flate-Stream (z. B. Fonts), ignorieren
    }
  }
  return content;
}

function extractText(content: string): string {
  let text = "";
  const hexRe = /<([0-9a-fA-F]+)>/g;
  let hexMatch: RegExpExecArray | null;
  while ((hexMatch = hexRe.exec(content)) !== null) {
    for (let i = 0; i < hexMatch[1].length; i += 2) {
      text += String.fromCharCode(parseInt(hexMatch[1].substr(i, 2), 16));
    }
  }
  return text;
}

// Skill-Bars bestehen aus zwei Rechtecken gleicher Höhe (Hintergrund + Füllung).
// Das Verhältnis Füllung/Hintergrund entspricht dem Skill-Wert in Prozent.
function extractSkillBarRatios(content: string): number[] {
  const rectRe = /[\d.]+ [\d.]+ ([\d.]+) (-?[\d.]+) re/g;
  const widths: number[] = [];
  let rectMatch: RegExpExecArray | null;
  while ((rectMatch = rectRe.exec(content)) !== null) {
    if (Math.abs(Math.abs(parseFloat(rectMatch[2])) - 4) < 0.5) {
      widths.push(parseFloat(rectMatch[1]));
    }
  }
  const ratios: number[] = [];
  for (let i = 0; i + 1 < widths.length; i += 2) {
    ratios.push(widths[i + 1] / widths[i]);
  }
  return ratios;
}

test.describe("Issue #32 – Legacy-Profil-Migration (String-Format) auf /de/generate", () => {
  test("altes String-Format-Profil wird migriert und Skill-Werte erscheinen als 60% im generierten Lebenslauf", async ({ page }) => {
    await registerAndLogin(page, uniqueEmail("e2e-legacy-profile-migration"), "Correct-1");

    await page.goto("/de/generate");
    await page.evaluate((p) => {
      localStorage.setItem("jobtrix_profile", JSON.stringify(p));
    }, PROFILE_OLD_FORMAT);
    await page.reload();

    await page.route("**/api/generate", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ coverLetter: "Brief", cv: "Lebenslauf-Inhalt", emailSubject: "Bewerbung" }),
      })
    );

    await page.getByRole("textbox", { name: /Stellenanzeige/i }).fill("Wir suchen eine Entwicklerin.");
    await expect(page.getByRole("button", { name: /Bewerbung generieren/i })).toBeEnabled();
    await page.getByRole("button", { name: /Bewerbung generieren/i }).click();
    await page.waitForSelector("textarea[aria-label='Anschreiben']");

    await page.getByRole("button", { name: "Modern", exact: true }).click();
    await page.getByTestId("cv-agree-checkbox").check();

    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("button", { name: /Lebenslauf als PDF/i }).click(),
    ]);

    const path = await download.path();
    const buf = fs.readFileSync(path!);
    const content = decodePdfStreams(buf);

    const text = extractText(content);
    expect(text).toContain("Python");
    expect(text).toContain("SQL");
    expect(text).toContain("Datenanalyse");

    const ratios = extractSkillBarRatios(content);
    expect(ratios.length).toBe(3);
    for (const ratio of ratios) {
      expect(ratio).toBeCloseTo(0.6, 1);
    }
  });
});
