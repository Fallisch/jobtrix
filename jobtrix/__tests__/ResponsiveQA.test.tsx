import fs from "fs";
import path from "path";

const globalsPath = path.join(__dirname, "..", "app", "globals.css");
const css = fs.readFileSync(globalsPath, "utf-8");

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.substring(0, 2), 16),
    parseInt(h.substring(2, 4), 16),
    parseInt(h.substring(4, 6), 16),
  ];
}

function relativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function contrastRatio(hex1: string, hex2: string): number {
  const [r1, g1, b1] = hexToRgb(hex1);
  const [r2, g2, b2] = hexToRgb(hex2);
  const l1 = relativeLuminance(r1, g1, b1);
  const l2 = relativeLuminance(r2, g2, b2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

describe("Responsive QA Pass", () => {
  describe("Touch-Targets", () => {
    test("globals.css definiert min-width und min-height 44px für interaktive Elemente", () => {
      expect(css).toContain("min-width: 44px");
      expect(css).toContain("min-height: 44px");
    });
  });

  describe("prefers-reduced-motion", () => {
    test("globals.css respektiert reduced-motion", () => {
      expect(css).toMatch(/prefers-reduced-motion\s*:\s*reduce/);
    });
  });

  describe("Body-Basisschrift", () => {
    test("body hat mindestens 16px font-size", () => {
      expect(css).toMatch(/font-size\s*:\s*16px/);
    });
  });

  describe("WCAG AA Kontraste (Light + Dark)", () => {
    const combinations = [
      { name: "Light: text auf background", fg: "#0F172A", bg: "#FAFBFC", min: 4.5 },
      { name: "Light: text auf surface", fg: "#0F172A", bg: "#F1F5F9", min: 4.5 },
      { name: "Light: primary auf background", fg: "#16325B", bg: "#FAFBFC", min: 4.5 },
      { name: "Light: accent auf background", fg: "#3B82F6", bg: "#FAFBFC", min: 3.0 },
      { name: "Dark: text auf background", fg: "#F1F5F9", bg: "#0B1120", min: 4.5 },
      { name: "Dark: text auf surface", fg: "#F1F5F9", bg: "#1A2332", min: 4.5 },
      { name: "Dark: primary auf background", fg: "#5580C2", bg: "#0B1120", min: 4.5 },
      { name: "Dark: accent auf background", fg: "#60A5FA", bg: "#0B1120", min: 3.0 },
      { name: "White auf accent (Button)", fg: "#FFFFFF", bg: "#3B82F6", min: 3.0 },
      { name: "White auf primary (Header)", fg: "#FFFFFF", bg: "#16325B", min: 4.5 },
    ];

    test.each(combinations)(
      "$name hat Kontrast >= $min:1",
      ({ fg, bg, min }) => {
        const ratio = contrastRatio(fg, bg);
        expect(ratio).toBeGreaterThanOrEqual(min);
      }
    );
  });

  describe("Responsive Layout Patterns", () => {
    const components = [
      "HeroSection.tsx",
      "FeaturesSection.tsx",
      "HowItWorksSection.tsx",
      "PricingCards.tsx",
      "ApplicationHistoryList.tsx",
      "ProfileForm.tsx",
    ];

    test.each(components)("%s hat responsive Klassen (sm: oder md: oder lg:)", (file) => {
      const source = fs.readFileSync(
        path.join(__dirname, "..", "components", file),
        "utf-8"
      );
      expect(source).toMatch(/sm:|md:|lg:/);
    });

    test("TrustBadges hat flex-wrap für Mobile", () => {
      const source = fs.readFileSync(
        path.join(__dirname, "..", "components", "TrustBadges.tsx"),
        "utf-8"
      );
      expect(source).toContain("flex-wrap");
    });
  });

  describe("max-w Constraints", () => {
    const constrainedPages = [
      "HowItWorksSection.tsx",
      "FeaturesSection.tsx",
      "PricingCards.tsx",
      "ApplicationHistoryList.tsx",
    ];

    test.each(constrainedPages)("%s hat max-w Constraint", (file) => {
      const source = fs.readFileSync(
        path.join(__dirname, "..", "components", file),
        "utf-8"
      );
      expect(source).toMatch(/max-w-/);
    });
  });
});
