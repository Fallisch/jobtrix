import { render, screen } from "@testing-library/react";
import ImpressumContent from "@/components/ImpressumContent";

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

describe("ImpressumContent", () => {
  beforeEach(() => setLocale("de"));

  it("zeigt die Überschrift und alle Kernabschnitte auf Deutsch an", () => {
    render(<ImpressumContent />);

    expect(screen.getByRole("heading", { level: 1, name: "Impressum" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /§ 5 TMG/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /vertretungsberechtigte personen/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /kontakt/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /umsatzsteuer-id/i })).toBeInTheDocument();
    expect(screen.getByText(/faltrix gbr/i)).toBeInTheDocument();
  });

  it("zeigt die Überschrift auf Englisch an", () => {
    setLocale("en");
    render(<ImpressumContent />);

    expect(screen.getByRole("heading", { level: 1, name: "Imprint" })).toBeInTheDocument();
  });
});
