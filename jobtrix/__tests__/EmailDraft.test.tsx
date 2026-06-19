import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import EmailDraft from "@/components/EmailDraft";

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

beforeEach(() => {
  Object.assign(navigator, { clipboard: { writeText: jest.fn().mockResolvedValue(undefined) } });
});

describe("EmailDraft", () => {
  it("zeigt den übergebenen Betreffvorschlag an", () => {
    render(<EmailDraft subject="Bewerbung als Entwickler – Max Mustermann" body="Sehr geehrte Damen und Herren" />);

    expect(screen.getByText("Bewerbung als Entwickler – Max Mustermann")).toBeInTheDocument();
  });

  it("zeigt den Anschreiben-Text als Textausgabe an", () => {
    render(<EmailDraft subject="Betreff" body="Mit großem Interesse bewerbe ich mich auf die ausgeschriebene Stelle." />);

    expect(
      screen.getByText("Mit großem Interesse bewerbe ich mich auf die ausgeschriebene Stelle.")
    ).toBeInTheDocument();
  });

  it("zeigt einen 'E-Mail versenden'-Button der einen mailto-Link öffnet", () => {
    render(<EmailDraft subject="Bewerbung als Dev" body="Sehr geehrte Damen" />);
    const link = screen.getByRole("link", { name: /sendEmailButton/i });
    expect(link).toHaveAttribute("href", expect.stringContaining("mailto:"));
    expect(link).toHaveAttribute("href", expect.stringContaining("subject=Bewerbung"));
    expect(link).toHaveAttribute("href", expect.stringContaining("body="));
  });

  it("zeigt eine Bestätigungs-Checkbox und der Send-Button ist erst nach Abhaken klickbar", () => {
    render(<EmailDraft subject="Betreff" body="Text" />);
    const checkbox = screen.getByTestId("email-confirm-checkbox");
    const link = screen.getByRole("link", { name: /sendEmailButton/i });

    expect(link).toHaveAttribute("aria-disabled", "true");

    fireEvent.click(checkbox);

    expect(link).toHaveAttribute("aria-disabled", "false");
  });

  it("zeigt einen Hinweis, dass Anhänge manuell beigefügt werden müssen", () => {
    render(<EmailDraft subject="Betreff" body="Text" />);
    expect(screen.getByText(/sendEmailAttachmentHint/i)).toBeInTheDocument();
  });

  describe("Kopieren in die Zwischenablage", () => {
    it("kopiert den Betreff und zeigt danach kurz 'Kopiert ✓' im Button an", async () => {
      render(<EmailDraft subject="Bewerbung als Entwickler – Max Mustermann" body="Anschreiben-Text" />);

      const copyButton = screen.getByRole("button", { name: /copySubject/i });
      fireEvent.click(copyButton);

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith("Bewerbung als Entwickler – Max Mustermann");
      await waitFor(() => expect(copyButton).toHaveTextContent("copied"));
    });

    it("kopiert den Anschreiben-Text und zeigt danach kurz 'Kopiert ✓' im Button an", async () => {
      render(<EmailDraft subject="Betreff" body="Anschreiben-Text für die E-Mail" />);

      const copyButton = screen.getByRole("button", { name: /copyBody/i });
      fireEvent.click(copyButton);

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith("Anschreiben-Text für die E-Mail");
      await waitFor(() => expect(copyButton).toHaveTextContent("copied"));
    });

    it("Betreff- und Anschreiben-Kopieren haben unabhängiges Feedback", async () => {
      render(<EmailDraft subject="Betreff-Text" body="Anschreiben-Text" />);

      const subjectButton = screen.getByRole("button", { name: /copySubject/i });
      const bodyButton = screen.getByRole("button", { name: /copyBody/i });

      fireEvent.click(subjectButton);

      await waitFor(() => expect(subjectButton).toHaveTextContent("copied"));
      expect(bodyButton).not.toHaveTextContent("copied");
    });
  });
});
