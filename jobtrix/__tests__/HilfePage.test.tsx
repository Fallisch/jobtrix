import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import HilfeContent from "@/components/HilfeContent";

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

describe("HilfeContent", () => {
  beforeEach(() => setLocale("de"));

  it("zeigt die Überschrift und alle sechs Themenblöcke aufklappbar auf Deutsch an", async () => {
    render(<HilfeContent />);

    expect(screen.getByRole("heading", { level: 1, name: "Hilfe" })).toBeInTheDocument();

    const items = [
      { question: /wie erstelle ich eine bewerbung/i, answer: /generiert jobtrix dein anschreiben/i },
      { question: /welche pakete gibt es/i, answer: /probegenerierung/i },
      { question: /^wie funktioniert die jobsuche/i, answer: /bundesagentur für arbeit/i },
      { question: /^wie wechsle ich pdf-layout/i, answer: /generierungsformular/i },
      { question: /exportiere.*daten.*lösche.*konto/i, answer: /konto & datenschutz/i },
      { question: /wie erreiche ich den support/i, answer: /support@example\.com/i },
    ];

    expect(document.querySelectorAll("details")).toHaveLength(items.length);

    for (const item of items) {
      const summary = screen.getByText(item.question);
      const details = summary.closest("details");
      expect(details).not.toBeNull();
      expect(details).not.toHaveAttribute("open");

      await userEvent.click(summary);

      expect(details).toHaveAttribute("open");
      expect(screen.getByText(item.answer)).toBeInTheDocument();
    }
  });

  it("zeigt die Überschrift auf Englisch an", () => {
    setLocale("en");
    render(<HilfeContent />);

    expect(screen.getByRole("heading", { level: 1, name: "Help" })).toBeInTheDocument();
  });
});
