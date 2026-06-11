import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ResetPasswordForm from "@/components/ResetPasswordForm";

const mockLocaleState: { locale: "de" | "en" } = { locale: "de" };

jest.mock("next-intl", () => {
  const de = require("@/messages/de.json");
  const en = require("@/messages/en.json");
  const dictionaries: Record<string, Record<string, unknown>> = { de, en };

  return {
    useTranslations:
      (namespace: string) =>
      (key: string, params?: Record<string, string | number>) => {
        const namespaceDict = namespace
          .split(".")
          .reduce<unknown>(
            (acc, part) => (acc as Record<string, unknown> | undefined)?.[part],
            dictionaries[mockLocaleState.locale]
          );
        const value = key
          .split(".")
          .reduce<unknown>(
            (acc, part) => (acc as Record<string, unknown> | undefined)?.[part],
            namespaceDict
          );
        if (typeof value !== "string") return key;
        if (!params) return value;
        return Object.entries(params).reduce(
          (acc, [k, v]) => acc.replaceAll(`{${k}}`, String(v)),
          value
        );
      },
  };
});

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
  useParams: () => ({ locale: "de" }),
}));

describe("ResetPasswordForm", () => {
  beforeEach(() => {
    mockLocaleState.locale = "de";
    global.fetch = jest.fn();
  });

  it("zeigt Validierungsfehler bei leerem Formular", async () => {
    render(<ResetPasswordForm token="gueltiges-token" />);

    await userEvent.click(screen.getByRole("button", { name: "Passwort speichern" }));

    expect(await screen.findByText("Passwort ist erforderlich")).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("zeigt einen Fehler bei nicht uebereinstimmenden Passwoertern", async () => {
    render(<ResetPasswordForm token="gueltiges-token" />);

    await userEvent.type(screen.getByLabelText("Neues Passwort"), "neues-passwort");
    await userEvent.type(screen.getByLabelText("Passwort bestätigen"), "anderes-passwort");
    await userEvent.click(screen.getByRole("button", { name: "Passwort speichern" }));

    expect(await screen.findByText("Die Passwörter stimmen nicht überein")).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("setzt das Passwort mit gueltigem Token zurueck und zeigt eine Erfolgsmeldung", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true }),
    });

    render(<ResetPasswordForm token="gueltiges-token" />);

    await userEvent.type(screen.getByLabelText("Neues Passwort"), "neues-passwort");
    await userEvent.type(screen.getByLabelText("Passwort bestätigen"), "neues-passwort");
    await userEvent.click(screen.getByRole("button", { name: "Passwort speichern" }));

    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: "gueltiges-token", password: "neues-passwort" }),
      })
    );

    expect(
      await screen.findByText("Dein Passwort wurde erfolgreich geändert. Du kannst dich jetzt anmelden.")
    ).toBeInTheDocument();
  });

  it("zeigt eine verstaendliche Fehlermeldung bei ungueltigem oder abgelaufenem Token", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: "invalid_token" }),
    });

    render(<ResetPasswordForm token="abgelaufenes-token" />);

    await userEvent.type(screen.getByLabelText("Neues Passwort"), "neues-passwort");
    await userEvent.type(screen.getByLabelText("Passwort bestätigen"), "neues-passwort");
    await userEvent.click(screen.getByRole("button", { name: "Passwort speichern" }));

    expect(await screen.findByText("Link ungültig oder abgelaufen")).toBeInTheDocument();
    expect(screen.getByText("Dieser Link zum Zurücksetzen des Passworts ist ungültig oder abgelaufen.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Neuen Link anfordern" })).toHaveAttribute(
      "href",
      "/de/forgot-password"
    );
  });
});
