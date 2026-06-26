import { render, screen } from "@testing-library/react";
import PricingCards from "@/components/PricingCards";

jest.mock("next-intl", () => {
  const de = require("@/messages/de.json");

  function resolve(obj: Record<string, unknown>, path: string): unknown {
    return path.split(".").reduce<unknown>((acc, part) => {
      if (acc && typeof acc === "object") return (acc as Record<string, unknown>)[part];
      return undefined;
    }, obj);
  }

  return {
    useTranslations:
      (namespace: string) =>
      (key: string, params?: Record<string, unknown>) => {
        const ns = (de as Record<string, unknown>)[namespace];
        const value = resolve(ns as Record<string, unknown>, key);
        if (Array.isArray(value)) return value;
        if (typeof value === "string" && params) {
          return Object.entries(params).reduce(
            (s, [k, v]) => s.replace(`{${k}}`, String(v)),
            value
          );
        }
        return typeof value === "string" ? value : key;
      },
    useLocale: () => "de",
  };
});

const mockConfig = {
  limited: { priceEur: 4.99, durationDays: 30 },
  lifetime: { priceEur: 14.99 },
  monthly: { priceEur: 3.99 },
  yearly: { priceEur: 29.99 },
};

describe("Pricing Redesign", () => {
  test("Karten haben rounded-2xl", () => {
    const { container } = render(<PricingCards config={mockConfig} />);
    const cards = container.querySelectorAll("[class*='rounded-2xl']");
    expect(cards.length).toBeGreaterThanOrEqual(2);
  });

  test("Karten haben hover:shadow-md", () => {
    const { container } = render(<PricingCards config={mockConfig} />);
    const cards = container.querySelectorAll("[class*='hover:shadow-md']");
    expect(cards.length).toBeGreaterThanOrEqual(2);
  });

  test("Karten haben shadow-sm als Basis", () => {
    const { container } = render(<PricingCards config={mockConfig} />);
    const cards = container.querySelectorAll("[class*='shadow-sm']");
    expect(cards.length).toBeGreaterThanOrEqual(2);
  });

  test("TrixMarquee ist unter dem Titel eingebunden", () => {
    const { container } = render(<PricingCards config={mockConfig} />);
    const marquee = container.querySelector("[class*='marquee'],.marquee-track,[aria-hidden='true']");
    expect(marquee).not.toBeNull();
  });
});
