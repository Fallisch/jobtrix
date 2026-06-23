import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginForm from "@/components/LoginForm";
import { signIn } from "next-auth/react";

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
  useParams: () => ({ locale: "de" }),
}));

jest.mock("next-auth/react", () => ({
  signIn: jest.fn(),
}));

const mockNavigate = jest.fn();
jest.mock("@/lib/navigate", () => ({
  navigate: (...args: unknown[]) => mockNavigate(...args),
}));

const mockedSignIn = jest.mocked(signIn);

global.fetch = jest.fn();

describe("LoginForm", () => {
  beforeEach(() => {
    mockedSignIn.mockReset();
    (global.fetch as jest.Mock).mockReset();
    mockNavigate.mockClear();
  });

  it("zeigt Validierungsfehler bei leerem Formular", async () => {
    render(<LoginForm />);

    await userEvent.click(screen.getByRole("button", { name: "Anmelden" }));

    expect(await screen.findByText("E-Mail-Adresse ist erforderlich")).toBeInTheDocument();
    expect(screen.getByText("Passwort ist erforderlich")).toBeInTheDocument();
    expect(mockedSignIn).not.toHaveBeenCalled();
  });

  it("leitet nach Login zu /generate weiter wenn Profil vorhanden", async () => {
    mockedSignIn.mockResolvedValue({ error: null, status: 200, ok: true, url: null });
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ name: "Max Mustermann" }),
    });

    render(<LoginForm />);

    await userEvent.type(screen.getByLabelText("E-Mail"), "test@example.com");
    await userEvent.type(screen.getByLabelText("Passwort"), "correct-password");
    await userEvent.click(screen.getByRole("button", { name: "Anmelden" }));

    await waitFor(() => expect(mockedSignIn).toHaveBeenCalledWith("credentials", {
      email: "test@example.com",
      password: "correct-password",
      redirect: false,
    }));
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith("/de/generate"));
  });

  it("leitet nach Login zu /onboarding weiter wenn Profil leer", async () => {
    mockedSignIn.mockResolvedValue({ error: null, status: 200, ok: true, url: null });
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ name: "" }),
    });

    render(<LoginForm />);

    await userEvent.type(screen.getByLabelText("E-Mail"), "test@example.com");
    await userEvent.type(screen.getByLabelText("Passwort"), "correct-password");
    await userEvent.click(screen.getByRole("button", { name: "Anmelden" }));

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith("/de/onboarding"));
  });

  it("verlinkt auf die Passwort-vergessen-Seite", () => {
    render(<LoginForm />);

    expect(screen.getByRole("link", { name: "Passwort vergessen?" })).toHaveAttribute(
      "href",
      "/de/forgot-password"
    );
  });

  it("zeigt eine Fehlermeldung bei falschen Zugangsdaten", async () => {
    mockedSignIn.mockResolvedValue({ error: "CredentialsSignin", status: 401, ok: false, url: null });

    render(<LoginForm />);

    await userEvent.type(screen.getByLabelText("E-Mail"), "test@example.com");
    await userEvent.type(screen.getByLabelText("Passwort"), "falsches-passwort");
    await userEvent.click(screen.getByRole("button", { name: "Anmelden" }));

    expect(await screen.findByText("E-Mail oder Passwort ist falsch")).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
