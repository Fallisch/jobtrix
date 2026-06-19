import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import OnboardingForm from "@/components/OnboardingForm";

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string, params?: Record<string, string | number>) => {
    if (params) {
      return Object.entries(params).reduce((acc, [k, v]) => acc.replaceAll(`{${k}}`, String(v)), key);
    }
    return key;
  },
}));

const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useParams: () => ({ locale: "de" }),
}));

jest.mock("next-auth/react", () => ({
  useSession: () => ({
    data: { user: { email: "test@example.com" }, expires: "" },
    status: "authenticated",
  }),
}));

global.fetch = jest.fn();

beforeEach(() => {
  (global.fetch as jest.Mock).mockReset();
  mockPush.mockClear();
});

describe("OnboardingForm", () => {
  it("startet mit Schritt 1 und zeigt Willkommensnachricht", () => {
    render(<OnboardingForm />);
    expect(screen.getByText(/welcome/i)).toBeInTheDocument();
    expect(screen.getByText(/step1Title/i)).toBeInTheDocument();
  });

  it("zeigt Fehler wenn Name leer ist beim Weiter-Klick", () => {
    render(<OnboardingForm />);
    fireEvent.click(screen.getByRole("button", { name: /next/i }));
    expect(screen.getByText(/step1Error/i)).toBeInTheDocument();
  });

  it("navigiert durch alle 5 Schritte mit Weiter-Button", async () => {
    render(<OnboardingForm />);

    await userEvent.type(screen.getByRole("textbox", { name: /step1Title/i }), "Max");
    fireEvent.click(screen.getByRole("button", { name: /next/i }));
    expect(screen.getByText(/step2Title/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /next/i }));
    expect(screen.getByText(/step3Title/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /next/i }));
    expect(screen.getByText(/step4Title/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /next/i }));
    expect(screen.getByText(/step5Title/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /finish/i })).toBeInTheDocument();
  });

  it("füllt E-Mail aus Session vor in Schritt 2", async () => {
    render(<OnboardingForm />);

    await userEvent.type(screen.getByRole("textbox", { name: /step1Title/i }), "Max");
    fireEvent.click(screen.getByRole("button", { name: /next/i }));

    expect(screen.getByRole("textbox", { name: /step2Title/i })).toHaveValue("test@example.com");
  });

  it("speichert Profildaten und leitet zu /generate weiter", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });

    render(<OnboardingForm />);

    await userEvent.type(screen.getByRole("textbox", { name: /step1Title/i }), "Max Mustermann");
    fireEvent.click(screen.getByRole("button", { name: /next/i }));

    fireEvent.click(screen.getByRole("button", { name: /next/i }));
    fireEvent.click(screen.getByRole("button", { name: /next/i }));
    fireEvent.click(screen.getByRole("button", { name: /next/i }));

    fireEvent.click(screen.getByRole("button", { name: /finish/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/profile",
        expect.objectContaining({ method: "POST" })
      );
    });

    const body = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
    expect(body.name).toBe("Max Mustermann");
    expect(body.email).toBe("test@example.com");

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/de/generate");
    });
  });

  it("erlaubt Zurück-Navigation ab Schritt 2", async () => {
    render(<OnboardingForm />);

    expect(screen.queryByRole("button", { name: /back/i })).not.toBeInTheDocument();

    await userEvent.type(screen.getByRole("textbox", { name: /step1Title/i }), "Max");
    fireEvent.click(screen.getByRole("button", { name: /next/i }));

    fireEvent.click(screen.getByRole("button", { name: /back/i }));
    expect(screen.getByText(/step1Title/i)).toBeInTheDocument();
  });
});
