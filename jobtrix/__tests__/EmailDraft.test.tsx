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

jest.mock("@/lib/download-pdf", () => ({
  downloadCoverLetterPdf: jest.fn().mockResolvedValue(undefined),
  downloadCvPdf: jest.fn().mockResolvedValue(undefined),
}));

const defaultProps = {
  subject: "Bewerbung als Entwickler",
  body: "Sehr geehrte Damen und Herren",
  coverLetter: "Anschreiben-Text",
  cv: "Lebenslauf-Text",
  template: "classic" as const,
  cvStyle: "classic" as const,
  documentsConfirmed: true,
};

beforeEach(() => {
  Object.assign(navigator, { clipboard: { writeText: jest.fn().mockResolvedValue(undefined) } });
  window.open = jest.fn();
});

describe("EmailDraft", () => {
  it("zeigt Hinweis wenn Checkboxen nicht gesetzt sind", () => {
    render(<EmailDraft {...defaultProps} documentsConfirmed={false} />);
    expect(screen.getByTestId("confirm-hint")).toBeInTheDocument();
    expect(screen.getByTestId("recipient-input")).toBeDisabled();
  });

  it("erlaubt Eingabe und Vorschau wenn Checkboxen gesetzt", async () => {
    render(<EmailDraft {...defaultProps} />);
    expect(screen.queryByTestId("confirm-hint")).not.toBeInTheDocument();
    expect(screen.getByTestId("recipient-input")).toBeEnabled();

    await userEvent.type(screen.getByTestId("recipient-input"), "hr@firma.de");
    fireEvent.click(screen.getByTestId("send-email-button"));

    expect(screen.getByTestId("email-preview")).toBeInTheDocument();
    expect(screen.getByText("hr@firma.de")).toBeInTheDocument();
    expect(screen.getByText(/sendEmailPreviewAttachments/i)).toBeInTheDocument();
  });

  it("öffnet mailto-Link und zeigt Anleitungs-Popup nach Bestätigung", async () => {
    render(<EmailDraft {...defaultProps} />);
    await userEvent.type(screen.getByTestId("recipient-input"), "hr@firma.de");
    fireEvent.click(screen.getByTestId("send-email-button"));

    fireEvent.click(screen.getByTestId("confirm-send-button"));

    await waitFor(() => {
      expect(window.open).toHaveBeenCalledWith(
        expect.stringContaining("mailto:hr@firma.de"),
        "_blank"
      );
    });

    await waitFor(() => {
      expect(screen.getByTestId("send-guide-popup")).toBeInTheDocument();
    });
  });

  it("zeigt extrahierte E-Mail als Vorausfüllung", () => {
    render(<EmailDraft {...defaultProps} extractedEmail="jobs@firma.de" />);
    expect(screen.getByTestId("recipient-input")).toHaveValue("jobs@firma.de");
  });

  it("kann die Vorschau abbrechen", async () => {
    render(<EmailDraft {...defaultProps} />);
    await userEvent.type(screen.getByTestId("recipient-input"), "hr@firma.de");
    fireEvent.click(screen.getByTestId("send-email-button"));

    expect(screen.getByTestId("email-preview")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /sendEmailPreviewCancel/i }));

    expect(screen.queryByTestId("email-preview")).not.toBeInTheDocument();
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
