import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AccountSettings from "@/components/AccountSettings";

const mockSignOut = jest.fn();
jest.mock("next-auth/react", () => ({
  signOut: (...args: unknown[]) => mockSignOut(...args),
}));

jest.mock("next/navigation", () => ({
  useParams: () => ({ locale: "de" }),
}));

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

function mockFetch({ ok = true, status = ok ? 200 : 401 }: { ok?: boolean; status?: number } = {}) {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok,
      status,
      blob: async () => new Blob(["{}"], { type: "application/json" }),
    } as Response)
  ) as jest.Mock;
}

function mockDeleteFetch({ ok = true }: { ok?: boolean } = {}) {
  global.fetch = jest.fn((url: string) => {
    if (url === "/api/account/delete") {
      return Promise.resolve({
        ok,
        json: async () => (ok ? { success: true } : { error: "wrong_password" }),
      } as Response);
    }
    return Promise.resolve({
      ok: true,
      blob: async () => new Blob(["{}"], { type: "application/json" }),
    } as Response);
  }) as jest.Mock;
}

beforeEach(() => {
  setLocale("de");
  mockFetch();
  mockSignOut.mockReset();
  global.URL.createObjectURL = jest.fn(() => "blob:mock-url");
  global.URL.revokeObjectURL = jest.fn();
});

describe("AccountSettings", () => {
  it("rendert den Bereich 'Konto & Datenschutz'", () => {
    render(<AccountSettings />);
    expect(screen.getByRole("heading", { name: /konto & datenschutz/i })).toBeInTheDocument();
  });

  it("oeffnet Passwort-Panel und loest nach Eingabe einen POST-Request an /api/account/export aus", async () => {
    const user = userEvent.setup();
    render(<AccountSettings />);

    await user.click(screen.getByRole("button", { name: /meine daten herunterladen/i }));

    expect(screen.getByText(/bitte bestätige dein passwort/i)).toBeInTheDocument();

    await user.type(screen.getByLabelText(/aktuelles passwort/i), "mein-passwort");
    await user.click(screen.getByRole("button", { name: /^daten herunterladen$/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/account/export",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ password: "mein-passwort" }),
        })
      );
      expect(global.URL.createObjectURL).toHaveBeenCalled();
    });
  });

  it("zeigt eine Fehlermeldung, wenn der Export fehlschlaegt", async () => {
    const user = userEvent.setup();
    mockFetch({ ok: false });
    render(<AccountSettings />);

    await user.click(screen.getByRole("button", { name: /meine daten herunterladen/i }));
    await user.type(screen.getByLabelText(/aktuelles passwort/i), "mein-passwort");
    await user.click(screen.getByRole("button", { name: /^daten herunterladen$/i }));

    await waitFor(() => {
      expect(screen.getByText(/passwort ist falsch/i)).toBeInTheDocument();
    });
  });

  it("öffnet den Bestätigungsbereich mit Passwortfeld beim Klick auf 'Konto löschen'", async () => {
    const user = userEvent.setup();
    render(<AccountSettings />);

    expect(screen.queryByLabelText(/aktuelles passwort/i)).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /^konto löschen$/i }));

    expect(screen.getByLabelText(/aktuelles passwort/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /konto endgültig löschen/i })).toBeInTheDocument();
  });

  it("aktiviert 'Konto endgültig löschen' erst nach Eingabe des Passworts", async () => {
    const user = userEvent.setup();
    render(<AccountSettings />);

    await user.click(screen.getByRole("button", { name: /^konto löschen$/i }));

    const confirmButton = screen.getByRole("button", { name: /konto endgültig löschen/i });
    expect(confirmButton).toBeDisabled();

    await user.type(screen.getByLabelText(/aktuelles passwort/i), "mein-passwort");

    expect(confirmButton).toBeEnabled();
  });

  it("zeigt bei falschem Passwort eine Fehlermeldung und meldet nicht ab", async () => {
    const user = userEvent.setup();
    mockDeleteFetch({ ok: false });
    render(<AccountSettings />);

    await user.click(screen.getByRole("button", { name: /^konto löschen$/i }));
    await user.type(screen.getByLabelText(/aktuelles passwort/i), "falsches-passwort");
    await user.click(screen.getByRole("button", { name: /konto endgültig löschen/i }));

    await waitFor(() => {
      expect(screen.getByText(/passwort ist falsch/i)).toBeInTheDocument();
    });
    expect(mockSignOut).not.toHaveBeenCalled();
  });

  it("löscht das Konto bei korrektem Passwort und meldet den Nutzer ab", async () => {
    const user = userEvent.setup();
    mockDeleteFetch({ ok: true });
    render(<AccountSettings />);

    await user.click(screen.getByRole("button", { name: /^konto löschen$/i }));
    await user.type(screen.getByLabelText(/aktuelles passwort/i), "richtiges-passwort");
    await user.click(screen.getByRole("button", { name: /konto endgültig löschen/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/account/delete",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ password: "richtiges-passwort" }),
        })
      );
      expect(mockSignOut).toHaveBeenCalledWith({ callbackUrl: "/de" });
    });
  });
});
