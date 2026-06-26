import fs from "fs";
import path from "path";

const globalsPath = path.join(__dirname, "..", "app", "globals.css");
const tailwindPath = path.join(__dirname, "..", "tailwind.config.ts");

function readFile(filePath: string): string {
  return fs.readFileSync(filePath, "utf-8");
}

describe("Design Tokens", () => {
  const expectedTokens = {
    light: {
      "--color-primary": "#16325B",
      "--color-accent": "#3B82F6",
      "--color-background": "#FAFBFC",
      "--color-surface": "#F1F5F9",
      "--color-text": "#0F172A",
    },
    dark: {
      "--color-primary": "#5580C2",
      "--color-accent": "#60A5FA",
      "--color-background": "#0B1120",
      "--color-surface": "#1A2332",
      "--color-text": "#F1F5F9",
    },
  };

  let css: string;

  beforeAll(() => {
    css = readFile(globalsPath).toLowerCase();
  });

  describe("Farbvariablen", () => {
    test.each(Object.entries(expectedTokens.light))(
      "Light Mode: %s ist %s",
      (variable, value) => {
        const rootBlock = css.split(".dark")[0];
        expect(rootBlock).toContain(`${variable}: ${value}`.toLowerCase());
      }
    );

    test.each(Object.entries(expectedTokens.dark))(
      "Dark Mode: %s ist %s",
      (variable, value) => {
        const darkBlock = css.split(".dark")[1];
        expect(darkBlock).toBeDefined();
        expect(darkBlock).toContain(`${variable}: ${value}`.toLowerCase());
      }
    );
  });

  describe("Tailwind Config", () => {
    test("referenziert alle 5 CSS-Variablen", () => {
      const twConfig = readFile(tailwindPath);
      const tokens = ["primary", "accent", "background", "surface", "text"];
      for (const token of tokens) {
        expect(twConfig).toContain(`var(--color-${token})`);
      }
    });
  });

  describe("Globale Body-Transition", () => {
    test("enthält box-shadow", () => {
      expect(css).toContain("box-shadow");
      const transitionMatch = css.match(/transition\s*:[^;]+box-shadow[^;]*/);
      expect(transitionMatch).not.toBeNull();
    });
  });
});

describe("Accessibility Foundations", () => {
  let css: string;

  beforeAll(() => {
    css = readFile(globalsPath);
  });

  describe("Minimale Schriftgröße", () => {
    test("body hat mindestens 16px font-size Basis", () => {
      const smallFontSizes = css.match(/font-size\s*:\s*(\d+)px/g);
      if (smallFontSizes) {
        for (const match of smallFontSizes) {
          const size = parseInt(match.replace(/\D/g, ""), 10);
          expect(size).toBeGreaterThanOrEqual(16);
        }
      }
      expect(css).toMatch(/font-size\s*:\s*(1[6-9]|[2-9]\d|\d{3,})px|1rem/);
    });
  });

  describe("Touch-Targets", () => {
    test("interaktive Elemente haben min 44x44px", () => {
      expect(css).toMatch(/min-height\s*:\s*44px/);
      expect(css).toMatch(/min-width\s*:\s*44px/);
    });
  });

  describe("prefers-reduced-motion", () => {
    test("respektiert reduced-motion Präferenz", () => {
      expect(css).toMatch(
        /prefers-reduced-motion\s*:\s*reduce/
      );
    });
  });

  describe("WCAG AA Kontraste", () => {
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

    const combinations = [
      { name: "Light: text auf background", fg: "#0F172A", bg: "#FAFBFC" },
      { name: "Light: text auf surface", fg: "#0F172A", bg: "#F1F5F9" },
      { name: "Light: primary auf background", fg: "#16325B", bg: "#FAFBFC" },
      { name: "Dark: text auf background", fg: "#F1F5F9", bg: "#0B1120" },
      { name: "Dark: text auf surface", fg: "#F1F5F9", bg: "#1A2332" },
      { name: "Dark: primary auf background", fg: "#5580C2", bg: "#0B1120" },
    ];

    test.each(combinations)(
      "$name hat Kontrastverhältnis >= 4.5:1",
      ({ fg, bg }) => {
        const ratio = contrastRatio(fg, bg);
        expect(ratio).toBeGreaterThanOrEqual(4.5);
      }
    );
  });
});
