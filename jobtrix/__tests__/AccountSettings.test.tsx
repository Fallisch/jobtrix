import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AccountSettings from "@/components/AccountSettings";

const mockLocaleState: { locale: "de" | "en" } = { locale: "de" };

jest.mock("next-intl", () => {
  const de = require("@/messages/de.json");
  const en = require("@/messages/en.json");
  const dictionaries: Record<string, Record<string, unknown>> = { de, en };

  return {
    useTranslations:
      (namespace: string) =>
      (key: string) => {
        const namespaceDict = dictionaries[mockLocaleState.locale][namespace];
        const value = key
          .split(".")
          .reduce<unknown>(
            (acc, part) => (acc as Record<string, unknown> | undefined)?.[part],
            namespaceDict
          );
        return typeof value === "string" ? value : key;
      },
  };
});

function setLocale(locale: "de" | "en") {
  mockLocaleState.locale = locale;
}

function mockFetch({ ok = true }: { ok?: boolean } = {}) {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok,
      blob: async () => new Blob(["{}"], { type: "application/json" }),
    } as Response)
  ) as jest.Mock;
}

beforeEach(() => {
  setLocale("de");
  mockFetch();
  global.URL.createObjectURL = jest.fn(() => "blob:mock-url");
  global.URL.revokeObjectURL = jest.fn();
});

describe("AccountSettings", () => {
  it("rendert den Bereich 'Konto & Datenschutz'", () => {
    render(<AccountSettings />);
    expect(screen.getByRole("heading", { name: /konto & datenschutz/i })).toBeInTheDocument();
  });

  it("löst beim Klick auf 'Meine Daten herunterladen' einen Request an /api/account/export und einen Download aus", async () => {
    const user = userEvent.setup();
    render(<AccountSettings />);

    await user.click(screen.getByRole("button", { name: /meine daten herunterladen/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/account/export");
      expect(global.URL.createObjectURL).toHaveBeenCalled();
    });
  });

  it("zeigt eine Fehlermeldung, wenn der Export fehlschlägt", async () => {
    const user = userEvent.setup();
    mockFetch({ ok: false });
    render(<AccountSettings />);

    await user.click(screen.getByRole("button", { name: /meine daten herunterladen/i }));

    await waitFor(() => {
      expect(screen.getByText(/daten konnten nicht exportiert werden/i)).toBeInTheDocument();
    });
  });
});
