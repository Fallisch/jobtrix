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
    "Bewerbung ist für dich kein T R I X mehr",
    "T R I X deinen inneren Schweinehund aus",
  ];

  test("rendert genau 2 Slogans", () => {
    const { container } = render(<TrixMarquee />);
    const text = container.textContent || "";
    for (const phrase of expectedPhrases) {
      expect(text).toContain(phrase);
    }
    const bulletCount = (text.split("•").length - 1) / 2;
    expect(bulletCount).toBe(2);
  });

  test("DE-Slogans sind exakt wie spezifiziert", () => {
    const { container } = render(<TrixMarquee />);
    const text = container.textContent || "";
    expect(text).toContain("Bewerbung ist für dich kein T R I X mehr");
    expect(text).toContain("T R I X deinen inneren Schweinehund aus");
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

  test("verwendet Bullet-Trenner", () => {
    const { container } = render(<TrixMarquee />);
    expect(container.textContent).toContain("•");
  });

  test("hat uppercase und tracking-widest Styling", () => {
    const { container } = render(<TrixMarquee />);
    const marqueeEl = container.querySelector("[class*='uppercase']");
    expect(marqueeEl).not.toBeNull();
    const trackingEl = container.querySelector("[class*='tracking-widest']");
    expect(trackingEl).not.toBeNull();
  });
});
