import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RegisterForm from "@/components/RegisterForm";
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

const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useParams: () => ({ locale: "de" }),
}));

jest.mock("next-auth/react", () => ({
  signIn: jest.fn(),
}));

const mockedSignIn = jest.mocked(signIn);

describe("RegisterForm", () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockedSignIn.mockReset();
    global.fetch = jest.fn();
  });

  it("zeigt Validierungsfehler bei leerem Formular", async () => {
    render(<RegisterForm />);

    await userEvent.click(screen.getByRole("button", { name: "Registrieren" }));

    expect(await screen.findByText("E-Mail-Adresse ist erforderlich")).toBeInTheDocument();
    expect(screen.getByText("Passwort ist erforderlich")).toBeInTheDocument();
    expect(screen.getByText("Bitte akzeptiere die AGB und Datenschutzbestimmungen")).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("zeigt einen Fehler bei nicht übereinstimmenden Passwörtern", async () => {
    render(<RegisterForm />);

    await userEvent.type(screen.getByLabelText("E-Mail"), "test@example.com");
    await userEvent.type(screen.getByLabelText("Passwort"), "correct-password");
    await userEvent.type(screen.getByLabelText("Passwort bestätigen"), "anderes-passwort");
    await userEvent.click(screen.getByRole("checkbox"));
    await userEvent.click(screen.getByRole("button", { name: "Registrieren" }));

    expect(await screen.findByText("Die Passwörter stimmen nicht überein")).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("registriert erfolgreich, loggt automatisch ein und leitet zu /profile weiter", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ id: "user-1", email: "test@example.com" }),
    });
    mockedSignIn.mockResolvedValue({ error: null, status: 200, ok: true, url: null });

    render(<RegisterForm />);

    await userEvent.type(screen.getByLabelText("E-Mail"), "test@example.com");
    await userEvent.type(screen.getByLabelText("Passwort"), "correct-password");
    await userEvent.type(screen.getByLabelText("Passwort bestätigen"), "correct-password");
    await userEvent.click(screen.getByRole("checkbox"));
    await userEvent.click(screen.getByRole("button", { name: "Registrieren" }));

    await waitFor(() => expect(mockedSignIn).toHaveBeenCalledWith("credentials", {
      email: "test@example.com",
      password: "correct-password",
      redirect: false,
    }));
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/de/profile"));
  });

  it("verlinkt AGB und Datenschutzbestimmungen im Zustimmungs-Label, geöffnet in neuem Tab", () => {
    render(<RegisterForm />);

    const agbLink = screen.getByRole("link", { name: "AGB" });
    expect(agbLink).toHaveAttribute("href", "/de/agb");
    expect(agbLink).toHaveAttribute("target", "_blank");

    const datenschutzLink = screen.getByRole("link", { name: "Datenschutzbestimmungen" });
    expect(datenschutzLink).toHaveAttribute("href", "/de/datenschutz");
    expect(datenschutzLink).toHaveAttribute("target", "_blank");
  });

  it("zeigt eine Fehlermeldung wenn die E-Mail-Adresse bereits vergeben ist", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: async () => ({ error: "emailTaken" }),
    });

    render(<RegisterForm />);

    await userEvent.type(screen.getByLabelText("E-Mail"), "test@example.com");
    await userEvent.type(screen.getByLabelText("Passwort"), "correct-password");
    await userEvent.type(screen.getByLabelText("Passwort bestätigen"), "correct-password");
    await userEvent.click(screen.getByRole("checkbox"));
    await userEvent.click(screen.getByRole("button", { name: "Registrieren" }));

    expect(await screen.findByText("Diese E-Mail-Adresse wird bereits verwendet")).toBeInTheDocument();
    expect(mockedSignIn).not.toHaveBeenCalled();
  });
});
