import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import OnboardingForm from "@/components/OnboardingForm";

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
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
  it("zeigt Willkommensnachricht und Profilfelder an", () => {
    render(<OnboardingForm />);
    expect(screen.getByRole("heading", { name: /title/i })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /nameLabel/i })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /emailLabel/i })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /phoneLabel/i })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /addressLabel/i })).toBeInTheDocument();
  });

  it("füllt das E-Mail-Feld mit der Session-E-Mail vor", () => {
    render(<OnboardingForm />);
    expect(screen.getByRole("textbox", { name: /emailLabel/i })).toHaveValue("test@example.com");
  });

  it("zeigt Fehler wenn Name leer ist beim Absenden", async () => {
    render(<OnboardingForm />);
    fireEvent.click(screen.getByRole("button", { name: /submit/i }));

    expect(screen.getByText(/nameRequired/i)).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("speichert Profildaten und leitet zur Generierungs-Seite weiter", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });

    render(<OnboardingForm />);
    await userEvent.type(screen.getByRole("textbox", { name: /nameLabel/i }), "Max Mustermann");
    await userEvent.type(screen.getByRole("textbox", { name: /addressLabel/i }), "Musterstraße 1");
    fireEvent.click(screen.getByRole("button", { name: /submit/i }));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/profile",
        expect.objectContaining({ method: "POST" })
      );
    });

    const body = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
    expect(body.name).toBe("Max Mustermann");
    expect(body.email).toBe("test@example.com");
    expect(body.address).toBe("Musterstraße 1");

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/de/generate");
    });
  });
});
