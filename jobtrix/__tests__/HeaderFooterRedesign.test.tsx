import fs from "fs";
import path from "path";

const headerSource = fs.readFileSync(
  path.join(__dirname, "..", "components", "Header.tsx"),
  "utf-8"
);
const footerSource = fs.readFileSync(
  path.join(__dirname, "..", "components", "Footer.tsx"),
  "utf-8"
);
const welcomeSource = fs.readFileSync(
  path.join(__dirname, "..", "components", "WelcomeSlides.tsx"),
  "utf-8"
);

describe("Header, Footer, WelcomeSlides Redesign", () => {
  describe("Header", () => {
    test("Nav-Elemente haben hover:scale Animationen", () => {
      expect(headerSource).toMatch(/hover:scale/);
    });

    test("Header hat shadow und backdrop-blur oder shadow-md", () => {
      expect(headerSource).toMatch(/shadow/);
    });
  });

  describe("Footer", () => {
    test("Hat py-6 oder größeres Spacing", () => {
      expect(footerSource).toMatch(/py-[6-9]|py-1[0-9]|py-2[0-9]/);
    });

    test("Links haben transition-colors", () => {
      expect(footerSource).toContain("transition-colors");
    });
  });

  describe("WelcomeSlides", () => {
    test("Verwendet AnimatePresence für Seitenübergänge", () => {
      expect(welcomeSource).toContain("AnimatePresence");
    });

    test("CTA-Button hat rounded-full und min-h-[44px]", () => {
      expect(welcomeSource).toContain("rounded-full");
      expect(welcomeSource).toContain("min-h-[44px]");
    });
  });
});
