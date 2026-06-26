import fs from "fs";
import path from "path";

const source = fs.readFileSync(
  path.join(__dirname, "..", "components", "ProfileForm.tsx"),
  "utf-8"
);

describe("ProfileForm Redesign", () => {
  test("Eingabefelder haben rounded-xl statt rounded-md", () => {
    const inputMatches = source.match(/<input[\s\S]*?className="[^"]*"/g) || [];
    for (const match of inputMatches) {
      if (match.includes("type=\"file\"") || match.includes("hidden") || match.includes("checkbox")) continue;
      if (match.includes("rounded-")) {
        expect(match).toContain("rounded-xl");
        expect(match).not.toMatch(/rounded-md/);
      }
    }
  });

  test("Eingabefelder haben focus:ring-accent/50", () => {
    const focusRingOld = source.match(/focus:ring-accent(?!\/50)/g) || [];
    expect(focusRingOld.length).toBe(0);
  });

  test("Chips haben AnimatePresence oder motion für Animationen", () => {
    expect(source).toMatch(/AnimatePresence|motion\./);
  });

  test("Hat Sektions-Überschriften", () => {
    const headingCount = (source.match(/<h[23]/g) || []).length;
    expect(headingCount).toBeGreaterThanOrEqual(3);
  });
});
