import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ForgotPasswordForm from "@/components/ForgotPasswordForm";

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

describe("ForgotPasswordForm", () => {
  beforeEach(() => {
    mockLocaleState.locale = "de";
    global.fetch = jest.fn();
  });

  it("zeigt einen Validierungsfehler bei leerem Formular", async () => {
    render(<ForgotPasswordForm />);

    await userEvent.click(screen.getByRole("button", { name: "Link anfordern" }));

    expect(await screen.findByText("E-Mail-Adresse ist erforderlich")).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("sendet die Anfrage und zeigt eine Erfolgsmeldung", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true }),
    });

    render(<ForgotPasswordForm />);

    await userEvent.type(screen.getByLabelText("E-Mail"), "test@example.com");
    await userEvent.click(screen.getByRole("button", { name: "Link anfordern" }));

    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "test@example.com" }),
      })
    );

    expect(
      await screen.findByText(
        "Wenn ein Konto mit dieser E-Mail-Adresse existiert, haben wir dir einen Link zum Zurücksetzen des Passworts gesendet."
      )
    ).toBeInTheDocument();
  });
});
