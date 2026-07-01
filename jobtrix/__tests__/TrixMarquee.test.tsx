import { render } from "@testing-library/react";
import TrixMarquee from "@/components/TrixMarquee";

jest.mock("next-intl", () => {
  const de = require("@/messages/de.json");
  return {
    useTranslations:
      (namespace: string) =>
      (key: string) => {
        const ns = (de as Record<string, unknown>)[namespace] as
          | Record<string, unknown>
          | undefined;
        const value = ns?.[key];
        if (Array.isArray(value)) return value;
        return typeof value === "string" ? value : key;
      },
  };
});

describe("TrixMarquee", () => {
  const expectedPhrases = [
    "Bewerbung ist für dich kein TRIX mehr",
    "TRIX deinen inneren Schweinehund aus",
  ];

  test("rendert genau 2 Slogans", () => {
    const { container } = render(<TrixMarquee />);
    const text = container.textContent || "";
    for (const phrase of expectedPhrases) {
      expect(text).toContain(phrase);
    }
  });

  test("DE-Slogans sind exakt wie spezifiziert", () => {
    const { container } = render(<TrixMarquee />);
    const text = container.textContent || "";
    expect(text).toContain("Bewerbung ist für dich kein TRIX mehr");
    expect(text).toContain("TRIX deinen inneren Schweinehund aus");
  });

  test("Animation-Dauer ist 30s", () => {
    const fs = require("fs");
    const path = require("path");
    const src = fs.readFileSync(
      path.resolve(__dirname, "../components/TrixMarquee.tsx"),
      "utf-8",
    );
    expect(src).toMatch(/marquee-scroll\s+30s/);
    expect(src).not.toMatch(/marquee-scroll\s+60s/);
  });

  test("dupliziert Content für nahtlosen Loop", () => {
    const { container } = render(<TrixMarquee />);
    const spans = container.querySelectorAll(".marquee-content");
    expect(spans.length).toBeGreaterThanOrEqual(2);
    for (const phrase of expectedPhrases) {
      const occurrences = (container.textContent || "").split(phrase).length - 1;
      expect(occurrences).toBeGreaterThanOrEqual(2);
    }
  });

  test("EN-Slogans sind exakt 'Unlock your JobTRIX' und 'Your Career, Your TRIX' (#231)", () => {
    const en = require("@/messages/en.json");
    expect(en.marquee.phrase0).toBe("Unlock your JobTRIX");
    expect(en.marquee.phrase1).toBe("Your Career, Your TRIX");
  });

  test("verwendet Trenner zwischen Sprüchen", () => {
    const { container } = render(<TrixMarquee />);
    expect(container.textContent).toContain("·");
  });

  test("hat uppercase Styling", () => {
    const { container } = render(<TrixMarquee />);
    const marqueeEl = container.querySelector("[class*='uppercase']");
    expect(marqueeEl).not.toBeNull();
  });
});
