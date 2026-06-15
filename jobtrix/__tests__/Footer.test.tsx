import { render, screen } from "@testing-library/react";
import Footer from "@/components/Footer";

const mockLocaleState: { locale: "de" | "en" } = { locale: "de" };

jest.mock("next-intl", () => {
  const de = require("@/messages/de.json");
  const en = require("@/messages/en.json");
  const dictionaries: Record<string, Record<string, unknown>> = { de, en };

  return {
    useTranslations:
      (namespace: string) =>
      (key: string) => {
        const namespaceDict = dictionaries[mockLocaleState.locale][namespace] as
          | Record<string, unknown>
          | undefined;
        const value = namespaceDict?.[key];
        return typeof value === "string" ? value : key;
      },
  };
});

function setLocale(locale: "de" | "en") {
  mockLocaleState.locale = locale;
}

describe("Footer", () => {
  beforeEach(() => setLocale("de"));

  it("rendert fünf Links zu Impressum, Datenschutz, AGB, Hilfe und Preise für die Locale 'de'", () => {
    render(<Footer locale="de" />);

    expect(screen.getByRole("link", { name: "Impressum" })).toHaveAttribute("href", "/de/impressum");
    expect(screen.getByRole("link", { name: "Datenschutz" })).toHaveAttribute("href", "/de/datenschutz");
    expect(screen.getByRole("link", { name: "AGB" })).toHaveAttribute("href", "/de/agb");
    expect(screen.getByRole("link", { name: "Hilfe" })).toHaveAttribute("href", "/de/hilfe");
    expect(screen.getByRole("link", { name: "Preise" })).toHaveAttribute("href", "/de/pricing");
  });

  it("rendert fünf Links zu Impressum, Datenschutz, AGB, Hilfe und Preise für die Locale 'en'", () => {
    setLocale("en");
    render(<Footer locale="en" />);

    expect(screen.getByRole("link", { name: "Imprint" })).toHaveAttribute("href", "/en/impressum");
    expect(screen.getByRole("link", { name: "Privacy Policy" })).toHaveAttribute("href", "/en/datenschutz");
    expect(screen.getByRole("link", { name: "Terms" })).toHaveAttribute("href", "/en/agb");
    expect(screen.getByRole("link", { name: "Help" })).toHaveAttribute("href", "/en/hilfe");
    expect(screen.getByRole("link", { name: "Pricing" })).toHaveAttribute("href", "/en/pricing");
  });
});
