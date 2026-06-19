import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EmailDraft from "@/components/EmailDraft";

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

jest.mock("@/lib/profile-storage", () => ({
  loadProfile: () => ({
    name: "Max Mustermann",
    address: "Musterstraße 1",
    email: "max@example.com",
    phone: "",
    birthdate: "",
    photo: null,
    education: [],
    experience: [],
    qualifications: [],
    interests: [],
  }),
}));

const defaultProps = {
  subject: "Bewerbung als Entwickler",
  body: "Sehr geehrte Damen und Herren",
  coverLetter: "Anschreiben-Text",
  cv: "Lebenslauf-Text",
  template: "classic" as const,
  cvStyle: "classic" as const,
};

beforeEach(() => {
  Object.assign(navigator, { clipboard: { writeText: jest.fn().mockResolvedValue(undefined) } });
  global.fetch = jest.fn();
});

describe("EmailDraft", () => {
  it("zeigt den übergebenen Betreffvorschlag an", () => {
    render(<EmailDraft {...defaultProps} />);
    expect(screen.getByText("Bewerbung als Entwickler")).toBeInTheDocument();
  });

  it("zeigt den E-Mail-Text an", () => {
    render(<EmailDraft {...defaultProps} />);
    expect(screen.getByText("Sehr geehrte Damen und Herren")).toBeInTheDocument();
  });

  it("zeigt ein Empfänger-Eingabefeld und einen Senden-Button", () => {
    render(<EmailDraft {...defaultProps} />);
    expect(screen.getByTestId("recipient-input")).toBeInTheDocument();
    expect(screen.getByTestId("send-email-button")).toBeInTheDocument();
  });

  it("sendet die Bewerbung per API mit PDFs als Anhang", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true, json: () => Promise.resolve({ success: true }) });

    render(<EmailDraft {...defaultProps} />);
    await userEvent.type(screen.getByTestId("recipient-input"), "hr@firma.de");
    fireEvent.click(screen.getByTestId("send-email-button"));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/send-email",
        expect.objectContaining({ method: "POST" })
      );
    });

    const body = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
    expect(body.to).toBe("hr@firma.de");
    expect(body.subject).toBe("Bewerbung als Entwickler");
    expect(body.coverLetter).toBe("Anschreiben-Text");
    expect(body.cv).toBe("Lebenslauf-Text");
  });

  it("zeigt Erfolgsmeldung nach erfolgreichem Versand", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true, json: () => Promise.resolve({ success: true }) });

    render(<EmailDraft {...defaultProps} />);
    await userEvent.type(screen.getByTestId("recipient-input"), "hr@firma.de");
    fireEvent.click(screen.getByTestId("send-email-button"));

    await waitFor(() => {
      expect(screen.getByTestId("send-success")).toBeInTheDocument();
    });
  });

  it("zeigt Fehlermeldung bei fehlgeschlagenem Versand", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: false, json: () => Promise.resolve({ error: "send_failed" }) });

    render(<EmailDraft {...defaultProps} />);
    await userEvent.type(screen.getByTestId("recipient-input"), "hr@firma.de");
    fireEvent.click(screen.getByTestId("send-email-button"));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
  });

  it("zeigt Hinweis dass PDFs automatisch angehängt werden", () => {
    render(<EmailDraft {...defaultProps} />);
    expect(screen.getByText(/sendEmailInfo/i)).toBeInTheDocument();
  });

  describe("Kopieren in die Zwischenablage", () => {
    it("kopiert den Betreff", async () => {
      render(<EmailDraft {...defaultProps} />);
      fireEvent.click(screen.getByRole("button", { name: /copySubject/i }));
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith("Bewerbung als Entwickler");
      await waitFor(() => expect(screen.getByTestId("copy-subject-button")).toHaveTextContent("copied"));
    });

    it("kopiert den E-Mail-Text", async () => {
      render(<EmailDraft {...defaultProps} />);
      fireEvent.click(screen.getByRole("button", { name: /copyBody/i }));
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith("Sehr geehrte Damen und Herren");
      await waitFor(() => expect(screen.getByTestId("copy-body-button")).toHaveTextContent("copied"));
    });
  });
});
