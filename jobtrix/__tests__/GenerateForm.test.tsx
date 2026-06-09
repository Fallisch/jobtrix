import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import GenerateForm from "@/components/GenerateForm";

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
  useParams: () => ({ locale: "de" }),
}));

global.fetch = jest.fn();

const mockProfile = {
  name: "Max Mustermann",
  address: "Musterstraße 1",
  birthdate: "1990-01-01",
  photo: null,
  education: [{ id: "1", institution: "TU Berlin", degree: "B.Sc.", year: "2015" }],
  qualifications: [],
  interests: [],
};

beforeEach(() => {
  (global.fetch as jest.Mock).mockReset();
  localStorage.clear();
});

// Translation keys (mock returns key as-is)
const JOB_POSTING = /jobPostingLabel/i;
const COMPANY_NAME = /companyNameLabel/i;
const CONTACT_PERSON = /contactPersonLabel/i;
const GENERATE_BTN = /generateButton/i;

describe("GenerateForm", () => {
  describe("Eingabemaske", () => {
    it("rendert Textfeld für Stellenanzeige", () => {
      render(<GenerateForm />);
      expect(screen.getByRole("textbox", { name: JOB_POSTING })).toBeInTheDocument();
    });

    it("rendert optionales Feld für Firmenname", () => {
      render(<GenerateForm />);
      expect(screen.getByRole("textbox", { name: COMPANY_NAME })).toBeInTheDocument();
    });

    it("rendert optionales Feld für Ansprechpartner", () => {
      render(<GenerateForm />);
      expect(screen.getByRole("textbox", { name: CONTACT_PERSON })).toBeInTheDocument();
    });
  });

  describe("Button-Zustand", () => {
    it("Button ist deaktiviert wenn Stellenanzeige leer und kein Profil vorhanden", () => {
      render(<GenerateForm />);
      expect(screen.getByRole("button", { name: GENERATE_BTN })).toBeDisabled();
    });

    it("Button ist deaktiviert wenn Stellenanzeige leer aber Profil vorhanden", () => {
      localStorage.setItem("jobtrix_profile", JSON.stringify(mockProfile));
      render(<GenerateForm />);
      expect(screen.getByRole("button", { name: GENERATE_BTN })).toBeDisabled();
    });

    it("Button ist deaktiviert wenn Stellenanzeige ausgefüllt aber kein Profil vorhanden", async () => {
      render(<GenerateForm />);
      await userEvent.type(screen.getByRole("textbox", { name: JOB_POSTING }), "Wir suchen einen Entwickler");
      expect(screen.getByRole("button", { name: GENERATE_BTN })).toBeDisabled();
    });

    it("Button ist aktiv wenn Stellenanzeige ausgefüllt und Profil vorhanden", async () => {
      localStorage.setItem("jobtrix_profile", JSON.stringify(mockProfile));
      render(<GenerateForm />);
      await userEvent.type(screen.getByRole("textbox", { name: JOB_POSTING }), "Wir suchen einen Entwickler");
      expect(screen.getByRole("button", { name: GENERATE_BTN })).toBeEnabled();
    });
  });

  describe("Generierungsflow", () => {
    beforeEach(() => {
      localStorage.setItem("jobtrix_profile", JSON.stringify(mockProfile));
    });

    it("zeigt Lade-Animation während der Generierung", async () => {
      (global.fetch as jest.Mock).mockImplementation(() =>
        new Promise((resolve) =>
          setTimeout(() =>
            resolve({ ok: true, json: () => Promise.resolve({ coverLetter: "Brief", cv: "Lebenslauf" }) }),
          50)
        )
      );

      render(<GenerateForm />);
      await userEvent.type(screen.getByRole("textbox", { name: JOB_POSTING }), "Stelle");
      fireEvent.click(screen.getByRole("button", { name: GENERATE_BTN }));

      await waitFor(() => {
        expect(screen.getByTestId("loading-animation")).toBeInTheDocument();
      });
      expect(screen.getByTestId("loading-spinner")).toHaveClass("animate-spin");
      expect(screen.getByText("loading")).toBeInTheDocument();
    });

    it("zeigt Anschreiben und Lebenslauf getrennt nach erfolgreicher Generierung", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ coverLetter: "Sehr geehrte Damen", cv: "Max Mustermann, Lebenslauf" }),
      });

      render(<GenerateForm />);
      await userEvent.type(screen.getByRole("textbox", { name: JOB_POSTING }), "Stelle");
      fireEvent.click(screen.getByRole("button", { name: GENERATE_BTN }));

      await waitFor(() => {
        expect(screen.getByDisplayValue("Sehr geehrte Damen")).toBeInTheDocument();
        expect(screen.getByDisplayValue("Max Mustermann, Lebenslauf")).toBeInTheDocument();
      });
    });

    it("zeigt Fehlermeldung wenn API fehlschlägt", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ error: "Generierung fehlgeschlagen" }),
      });

      render(<GenerateForm />);
      await userEvent.type(screen.getByRole("textbox", { name: JOB_POSTING }), "Stelle");
      fireEvent.click(screen.getByRole("button", { name: GENERATE_BTN }));

      await waitFor(() => {
        expect(screen.getByRole("alert")).toBeInTheDocument();
      });
    });

    it("zeigt E-Mail-Entwurf-Sektion unterhalb von Anschreiben und Lebenslauf nach der Generierung", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            coverLetter: "Sehr geehrte Damen",
            cv: "Lebenslauf-Text",
            emailSubject: "Bewerbung als Entwickler – Max Mustermann",
          }),
      });

      render(<GenerateForm />);
      await userEvent.type(screen.getByRole("textbox", { name: JOB_POSTING }), "Stelle");
      fireEvent.click(screen.getByRole("button", { name: GENERATE_BTN }));

      await waitFor(() => {
        expect(screen.getByTestId("email-draft-section")).toBeInTheDocument();
      });

      const headings = screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent);
      expect(headings.indexOf("emailDraftTitle")).toBeGreaterThan(headings.indexOf("coverLetterTitle"));
      expect(headings.indexOf("emailDraftTitle")).toBeGreaterThan(headings.indexOf("cvTitle"));
    });

    it("zeigt Template-Auswahl nach Generierung mit Klassisch und Modern", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ coverLetter: "Brief", cv: "CV", emailSubject: "Betr" }),
      });

      render(<GenerateForm />);
      await userEvent.type(screen.getByRole("textbox", { name: JOB_POSTING }), "Stelle");
      fireEvent.click(screen.getByRole("button", { name: GENERATE_BTN }));

      await waitFor(() => screen.getByDisplayValue("Brief"));

      expect(screen.getByRole("button", { name: /templateClassic/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /templateModern/i })).toBeInTheDocument();
    });

    it("Klassisch ist standardmäßig ausgewählt", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ coverLetter: "Brief", cv: "CV", emailSubject: "Betr" }),
      });

      render(<GenerateForm />);
      await userEvent.type(screen.getByRole("textbox", { name: JOB_POSTING }), "Stelle");
      fireEvent.click(screen.getByRole("button", { name: GENERATE_BTN }));

      await waitFor(() => screen.getByDisplayValue("Brief"));

      expect(screen.getByRole("button", { name: /templateClassic/i })).toHaveAttribute("aria-pressed", "true");
      expect(screen.getByRole("button", { name: /templateModern/i })).toHaveAttribute("aria-pressed", "false");
    });

    it("Template-Auswahl bleibt nach erneutem Generieren erhalten", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ coverLetter: "Brief", cv: "CV", emailSubject: "Betr" }),
      });

      render(<GenerateForm />);
      await userEvent.type(screen.getByRole("textbox", { name: JOB_POSTING }), "Stelle");
      fireEvent.click(screen.getByRole("button", { name: GENERATE_BTN }));
      await waitFor(() => screen.getByDisplayValue("Brief"));

      // Auf Modern wechseln
      fireEvent.click(screen.getByRole("button", { name: /templateModern/i }));
      expect(screen.getByRole("button", { name: /templateModern/i })).toHaveAttribute("aria-pressed", "true");

      // Erneut generieren
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ coverLetter: "Neuer Brief", cv: "Neues CV", emailSubject: "Betr2" }),
      });
      fireEvent.click(screen.getByRole("button", { name: GENERATE_BTN }));
      await waitFor(() => screen.getByDisplayValue("Neuer Brief"));

      // Modern muss noch aktiv sein
      expect(screen.getByRole("button", { name: /templateModern/i })).toHaveAttribute("aria-pressed", "true");
      expect(screen.getByRole("button", { name: /templateClassic/i })).toHaveAttribute("aria-pressed", "false");
    });

    it("zeigt Lebenslauf-Stil-Auswahl mit Klassisch als Standard", () => {
      render(<GenerateForm />);
      const classicBtn = screen.getByRole("button", { name: /cvStyleClassic/i });
      const americanBtn = screen.getByRole("button", { name: /cvStyleAmerican/i });
      expect(classicBtn).toBeInTheDocument();
      expect(americanBtn).toBeInTheDocument();
      expect(classicBtn).toHaveAttribute("aria-pressed", "true");
      expect(americanBtn).toHaveAttribute("aria-pressed", "false");
    });

    it("sendet cvStyle classic standardmäßig beim Generieren", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ coverLetter: "Brief", cv: "CV", emailSubject: "Betr" }),
      });

      render(<GenerateForm />);
      await userEvent.type(screen.getByRole("textbox", { name: JOB_POSTING }), "Stelle");
      fireEvent.click(screen.getByRole("button", { name: GENERATE_BTN }));

      await waitFor(() => screen.getByDisplayValue("Brief"));

      const body = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
      expect(body.cvStyle).toBe("classic");
    });

    it("sendet cvStyle american wenn Amerikanisch ausgewählt", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ coverLetter: "Brief", cv: "CV", emailSubject: "Betr" }),
      });

      render(<GenerateForm />);
      fireEvent.click(screen.getByRole("button", { name: /cvStyleAmerican/i }));
      await userEvent.type(screen.getByRole("textbox", { name: JOB_POSTING }), "Stelle");
      fireEvent.click(screen.getByRole("button", { name: GENERATE_BTN }));

      await waitFor(() => screen.getByDisplayValue("Brief"));

      const body = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
      expect(body.cvStyle).toBe("american");
    });

    it("zeigt Farbpalette mit mindestens 5 Optionen wenn Modern-Template aktiv", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ coverLetter: "Brief", cv: "CV", emailSubject: "Betr" }),
      });

      render(<GenerateForm />);
      await userEvent.type(screen.getByRole("textbox", { name: JOB_POSTING }), "Stelle");
      fireEvent.click(screen.getByRole("button", { name: GENERATE_BTN }));
      await waitFor(() => screen.getByDisplayValue("Brief"));

      fireEvent.click(screen.getByRole("button", { name: /templateModern/i }));

      const palette = screen.getByTestId("color-palette");
      expect(palette).toBeInTheDocument();
      const colorButtons = palette.querySelectorAll("button");
      expect(colorButtons.length).toBeGreaterThanOrEqual(5);
    });

    it("Farbpalette ist ausgeblendet wenn Klassisch-Template aktiv", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ coverLetter: "Brief", cv: "CV", emailSubject: "Betr" }),
      });

      render(<GenerateForm />);
      await userEvent.type(screen.getByRole("textbox", { name: JOB_POSTING }), "Stelle");
      fireEvent.click(screen.getByRole("button", { name: GENERATE_BTN }));
      await waitFor(() => screen.getByDisplayValue("Brief"));

      // Klassisch ist Standard → keine Palette
      expect(screen.queryByTestId("color-palette")).not.toBeInTheDocument();

      // Modern auswählen → Palette erscheint
      fireEvent.click(screen.getByRole("button", { name: /templateModern/i }));
      expect(screen.getByTestId("color-palette")).toBeInTheDocument();

      // Zurück zu Klassisch → Palette verschwindet
      fireEvent.click(screen.getByRole("button", { name: /templateClassic/i }));
      expect(screen.queryByTestId("color-palette")).not.toBeInTheDocument();
    });

    it("Standardfarbe #1E3A5F ist initial ausgewählt", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ coverLetter: "Brief", cv: "CV", emailSubject: "Betr" }),
      });

      render(<GenerateForm />);
      await userEvent.type(screen.getByRole("textbox", { name: JOB_POSTING }), "Stelle");
      fireEvent.click(screen.getByRole("button", { name: GENERATE_BTN }));
      await waitFor(() => screen.getByDisplayValue("Brief"));

      fireEvent.click(screen.getByRole("button", { name: /templateModern/i }));

      const defaultBtn = screen.getByRole("button", { name: /Farbe #1E3A5F/i });
      expect(defaultBtn).toHaveAttribute("aria-pressed", "true");
    });

    it("Änderungen an Anschreiben bleiben bis zum Neustart erhalten", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ coverLetter: "Originaltext", cv: "CV" }),
      });

      render(<GenerateForm />);
      await userEvent.type(screen.getByRole("textbox", { name: JOB_POSTING }), "Stelle");
      fireEvent.click(screen.getByRole("button", { name: GENERATE_BTN }));

      await waitFor(() => screen.getByDisplayValue("Originaltext"));

      const coverLetterArea = screen.getByDisplayValue("Originaltext");
      await userEvent.clear(coverLetterArea);
      await userEvent.type(coverLetterArea, "Bearbeiteter Text");

      expect(screen.getByDisplayValue("Bearbeiteter Text")).toBeInTheDocument();
    });
  });
});
