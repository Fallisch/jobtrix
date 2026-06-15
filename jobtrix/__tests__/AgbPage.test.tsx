import { render, screen } from "@testing-library/react";
import AgbContent from "@/components/AgbContent";

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

describe("AgbContent", () => {
  beforeEach(() => setLocale("de"));

  it("zeigt die Überschrift und alle Kernabschnitte auf Deutsch an", () => {
    render(<AgbContent />);

    expect(screen.getByRole("heading", { level: 1, name: "AGB" })).toBeInTheDocument();

    const sectionHeadings = [
      /vertragsgegenstand/i,
      /pakete/i,
      /zahlungsabwicklung/i,
      /widerrufsrecht/i,
      /haftungsausschluss/i,
      /nutzungsrechte/i,
      /laufzeit/i,
    ];

    for (const heading of sectionHeadings) {
      expect(screen.getByRole("heading", { name: heading })).toBeInTheDocument();
    }

    expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(sectionHeadings.length);
  });

  it("zeigt die Überschrift auf Englisch an", () => {
    setLocale("en");
    render(<AgbContent />);

    expect(screen.getByRole("heading", { level: 1, name: "Terms and Conditions" })).toBeInTheDocument();
  });
});
