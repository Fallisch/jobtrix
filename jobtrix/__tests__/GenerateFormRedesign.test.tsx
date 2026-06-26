import fs from "fs";
import path from "path";

const generateFormPath = path.join(__dirname, "..", "components", "GenerateForm.tsx");
const source = fs.readFileSync(generateFormPath, "utf-8");

describe("GenerateForm Redesign", () => {
  test("Eingabefelder haben focus:ring-accent/50", () => {
    const focusRingMatches = source.match(/focus:ring-2 focus:ring-accent(?!\/50)/g) || [];
    expect(focusRingMatches.length).toBe(0);
  });

  test("Eingabefelder haben min-h-[44px]", () => {
    const inputMatches = source.match(/<input[\s\S]*?className="[^"]*"/g) || [];
    for (const match of inputMatches) {
      if (match.includes("checkbox") || match.includes("h-4") || match.includes("type=\"file\"") || match.includes("hidden")) continue;
      expect(match).toContain("min-h-[44px]");
    }
  });

  test("Sektionen haben Trennlinien (border-b oder divide)", () => {
    expect(source).toMatch(/border-b|divide-y/);
  });

  test("Template-Auswahl hat Hover-Effekte", () => {
    expect(source).toMatch(/hover:shadow-md|hover:scale|hover:border-accent/);
  });

  test("TrixMarquee wird nach Generierung importiert und eingebunden", () => {
    expect(source).toContain("TrixMarquee");
  });
});
