import { render, screen } from "@testing-library/react";
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
    "Trix deinen inneren Schweinehund aus",
    "Bewerbung? Kein Trix — einfach machen",
    "Der JobTRIX für deine Karriere",
    "Kein Hexenwerk, sondern JobTRIX",
    "Dein nächster Job ist nur einen Trix entfernt",
  ];

  test("rendert alle Sprüche", () => {
    const { container } = render(<TrixMarquee />);
    for (const phrase of expectedPhrases) {
      expect(container.textContent).toContain(phrase);
    }
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

  test("hat text-sm Styling", () => {
    const { container } = render(<TrixMarquee />);
    const el = container.querySelector("[class*='text-sm']");
    expect(el).not.toBeNull();
  });
});
