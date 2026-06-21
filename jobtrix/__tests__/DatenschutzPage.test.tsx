import { render, screen } from "@testing-library/react";
import DatenschutzContent from "@/components/DatenschutzContent";

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

describe("DatenschutzContent", () => {
  beforeEach(() => setLocale("de"));

  it("zeigt die Überschrift und alle Abschnitte auf Deutsch an", () => {
    render(<DatenschutzContent />);

    expect(screen.getByRole("heading", { level: 1, name: "Datenschutzerklärung" })).toBeInTheDocument();

    const sectionHeadings = [
      /verantwortlicher/i,
      /registrierung.*login.*session/i,
      /profildaten/i,
      /ki-gestützte generierung/i,
      /jobsuche/i,
      /zahlungsabwicklung/i,
      /e-mail-versand/i,
      /hosting/i,
      /sicherheitsprotokollierung/i,
      /speicherdauer/i,
      /deine rechte/i,
      /beschwerderecht/i,
      /cookies/i,
    ];

    for (const heading of sectionHeadings) {
      expect(screen.getByRole("heading", { name: heading })).toBeInTheDocument();
    }

    expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(sectionHeadings.length);
    expect(screen.getByText(/konto & datenschutz/i)).toBeInTheDocument();
  });

  it("zeigt die Überschrift auf Englisch an", () => {
    setLocale("en");
    render(<DatenschutzContent />);

    expect(screen.getByRole("heading", { level: 1, name: "Privacy Policy" })).toBeInTheDocument();
  });
});
