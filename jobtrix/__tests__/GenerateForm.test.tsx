import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import GenerateForm from "@/components/GenerateForm";

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
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
  mockPush.mockClear();
  localStorage.clear();
});

// Translation keys (mock returns key as-is)
const JOB_POSTING = /jobPostingLabel/i;
const JOB_TITLE = /jobTitleLabel/i;
const COMPANY_NAME = /companyNameLabel/i;
const CONTACT_PERSON = /contactPersonLabel/i;
const GENERATE_BTN = /generateButton/i;

describe("GenerateForm", () => {
  describe("Eingabemaske", () => {
    it("rendert Textfeld für Stellenanzeige", () => {
      render(<GenerateForm />);
      expect(screen.getByRole("textbox", { name: JOB_POSTING })).toBeInTheDocument();
    });

    it("rendert optionales Feld für Stellentitel", () => {
      render(<GenerateForm />);
      expect(screen.getByRole("textbox", { name: JOB_TITLE })).toBeInTheDocument();
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

    it("leitet zur Bezahlseite weiter wenn die API 'Zugang erforderlich' meldet", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 402,
        json: () => Promise.resolve({ error: "access_required" }),
      });

      render(<GenerateForm />);
      await userEvent.type(screen.getByRole("textbox", { name: JOB_POSTING }), "Stelle");
      fireEvent.click(screen.getByRole("button", { name: GENERATE_BTN }));

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/de/pricing");
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

    it("sendet das aktuell ausgewählte Layout beim Generieren an /api/generate", async () => {
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

      // Erneut generieren
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ coverLetter: "Neuer Brief", cv: "Neues CV", emailSubject: "Betr2" }),
      });
      fireEvent.click(screen.getByRole("button", { name: GENERATE_BTN }));
      await waitFor(() => screen.getByDisplayValue("Neuer Brief"));

      const lastCall = (global.fetch as jest.Mock).mock.calls.at(-1) as [string, RequestInit];
      const body = JSON.parse(lastCall[1].body as string);
      expect(body.template).toBe("modern");
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

      const lastCall = (global.fetch as jest.Mock).mock.calls.at(-1) as [string, RequestInit];
      const body = JSON.parse(lastCall[1].body as string);
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

      const lastCall = (global.fetch as jest.Mock).mock.calls.at(-1) as [string, RequestInit];
      const body = JSON.parse(lastCall[1].body as string);
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

  describe("Profil-Synchronisierung mit /api/profile", () => {
    const apiProfile = {
      name: "Anna Beispiel",
      address: "Hauptstraße 5",
      email: "anna@example.com",
      phone: "0151 123456",
      birthdate: "1990-01-01",
      photo: null,
      education: [{ id: "1", institution: "HU Berlin", degree: "M.Sc.", year: "2018" }],
      experience: [{ id: "1", company: "Acme GmbH", position: "Entwickler", period: "01/2020 - 12/2022", tasks: "Backend" }],
      qualifications: [],
      interests: [],
    };

    it("übernimmt das in /api/profile gespeicherte Profil (inkl. Berufserfahrung) in localStorage", async () => {
      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url === "/api/profile") {
          return Promise.resolve({ ok: true, json: () => Promise.resolve(apiProfile) });
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
      });

      render(<GenerateForm />);

      await waitFor(() => {
        const stored = JSON.parse(localStorage.getItem("jobtrix_profile") ?? "null");
        expect(stored?.experience).toEqual(apiProfile.experience);
      });
    });

    it("überschreibt ein vorhandenes localStorage-Profil nicht, wenn /api/profile kein gespeichertes Profil liefert", async () => {
      localStorage.setItem("jobtrix_profile", JSON.stringify(mockProfile));
      (global.fetch as jest.Mock).mockImplementation((url: string) => {
        if (url === "/api/profile") {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({
                name: "",
                address: "",
                email: "",
                phone: "",
                birthdate: "",
                photo: null,
                education: [],
                experience: [],
                qualifications: [],
                interests: [],
              }),
          });
        }
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
      });

      render(<GenerateForm />);

      await waitFor(() => {
        expect((global.fetch as jest.Mock)).toHaveBeenCalledWith("/api/profile");
      });
      await new Promise((r) => setTimeout(r, 0));

      const stored = JSON.parse(localStorage.getItem("jobtrix_profile") ?? "null");
      expect(stored).toEqual(mockProfile);
    });
  });

  describe("Layout-Auswahl Traditionell", () => {
    beforeEach(() => {
      localStorage.setItem("jobtrix_profile", JSON.stringify(mockProfile));
    });

    it("zeigt Template-Option Traditionell zusätzlich zu Klassisch und Modern", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ coverLetter: "Brief", cv: "CV", emailSubject: "Betr" }),
      });

      render(<GenerateForm />);
      await userEvent.type(screen.getByRole("textbox", { name: JOB_POSTING }), "Stelle");
      fireEvent.click(screen.getByRole("button", { name: GENERATE_BTN }));
      await waitFor(() => screen.getByDisplayValue("Brief"));

      const traditionalBtn = screen.getByRole("button", { name: /templateTraditional/i });
      expect(traditionalBtn).toBeInTheDocument();
      expect(traditionalBtn).toHaveAttribute("aria-pressed", "false");
    });

    it("sendet 'traditional' an /api/generate wenn Traditionell ausgewählt ist", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ coverLetter: "Brief", cv: "CV", emailSubject: "Betr" }),
      });

      render(<GenerateForm />);
      await userEvent.type(screen.getByRole("textbox", { name: JOB_POSTING }), "Stelle");
      fireEvent.click(screen.getByRole("button", { name: GENERATE_BTN }));
      await waitFor(() => screen.getByDisplayValue("Brief"));

      fireEvent.click(screen.getByRole("button", { name: /templateTraditional/i }));
      expect(screen.getByRole("button", { name: /templateTraditional/i })).toHaveAttribute("aria-pressed", "true");

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ coverLetter: "Neuer Brief", cv: "Neues CV", emailSubject: "Betr2" }),
      });
      fireEvent.click(screen.getByRole("button", { name: GENERATE_BTN }));
      await waitFor(() => screen.getByDisplayValue("Neuer Brief"));

      const lastCall = (global.fetch as jest.Mock).mock.calls.at(-1) as [string, RequestInit];
      const body = JSON.parse(lastCall[1].body as string);
      expect(body.template).toBe("traditional");
    });

    it("Farbpalette bleibt ausgeblendet wenn Traditionell-Template aktiv", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ coverLetter: "Brief", cv: "CV", emailSubject: "Betr" }),
      });

      render(<GenerateForm />);
      await userEvent.type(screen.getByRole("textbox", { name: JOB_POSTING }), "Stelle");
      fireEvent.click(screen.getByRole("button", { name: GENERATE_BTN }));
      await waitFor(() => screen.getByDisplayValue("Brief"));

      fireEvent.click(screen.getByRole("button", { name: /templateTraditional/i }));

      expect(screen.queryByTestId("color-palette")).not.toBeInTheDocument();
    });
  });

  describe("Layout-Auswahl Akzent", () => {
    beforeEach(() => {
      localStorage.setItem("jobtrix_profile", JSON.stringify(mockProfile));
    });

    it("zeigt Template-Option Akzent zusätzlich zu den anderen Layouts", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ coverLetter: "Brief", cv: "CV", emailSubject: "Betr" }),
      });

      render(<GenerateForm />);
      await userEvent.type(screen.getByRole("textbox", { name: JOB_POSTING }), "Stelle");
      fireEvent.click(screen.getByRole("button", { name: GENERATE_BTN }));
      await waitFor(() => screen.getByDisplayValue("Brief"));

      const accentBtn = screen.getByRole("button", { name: /templateAccent/i });
      expect(accentBtn).toBeInTheDocument();
      expect(accentBtn).toHaveAttribute("aria-pressed", "false");
    });

    it("sendet 'accent' an /api/generate wenn Akzent ausgewählt ist", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ coverLetter: "Brief", cv: "CV", emailSubject: "Betr" }),
      });

      render(<GenerateForm />);
      await userEvent.type(screen.getByRole("textbox", { name: JOB_POSTING }), "Stelle");
      fireEvent.click(screen.getByRole("button", { name: GENERATE_BTN }));
      await waitFor(() => screen.getByDisplayValue("Brief"));

      fireEvent.click(screen.getByRole("button", { name: /templateAccent/i }));
      expect(screen.getByRole("button", { name: /templateAccent/i })).toHaveAttribute("aria-pressed", "true");

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ coverLetter: "Neuer Brief", cv: "Neues CV", emailSubject: "Betr2" }),
      });
      fireEvent.click(screen.getByRole("button", { name: GENERATE_BTN }));
      await waitFor(() => screen.getByDisplayValue("Neuer Brief"));

      const lastCall = (global.fetch as jest.Mock).mock.calls.at(-1) as [string, RequestInit];
      const body = JSON.parse(lastCall[1].body as string);
      expect(body.template).toBe("accent");
    });

    it("sendet die ausgewählte Akzentfarbe an /api/generate", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ coverLetter: "Brief", cv: "CV", emailSubject: "Betr" }),
      });

      render(<GenerateForm />);
      await userEvent.type(screen.getByRole("textbox", { name: JOB_POSTING }), "Stelle");
      fireEvent.click(screen.getByRole("button", { name: GENERATE_BTN }));
      await waitFor(() => screen.getByDisplayValue("Brief"));

      fireEvent.click(screen.getByRole("button", { name: /templateAccent/i }));
      fireEvent.click(screen.getByRole("button", { name: "Farbe #1A5C38" }));

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ coverLetter: "Neuer Brief", cv: "Neues CV", emailSubject: "Betr2" }),
      });
      fireEvent.click(screen.getByRole("button", { name: GENERATE_BTN }));
      await waitFor(() => screen.getByDisplayValue("Neuer Brief"));

      const lastCall = (global.fetch as jest.Mock).mock.calls.at(-1) as [string, RequestInit];
      const body = JSON.parse(lastCall[1].body as string);
      expect(body.accentColor).toBe("#1A5C38");
    });

    it("zeigt Akzentfarben-Palette wenn Akzent-Template aktiv ist", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ coverLetter: "Brief", cv: "CV", emailSubject: "Betr" }),
      });

      render(<GenerateForm />);
      await userEvent.type(screen.getByRole("textbox", { name: JOB_POSTING }), "Stelle");
      fireEvent.click(screen.getByRole("button", { name: GENERATE_BTN }));
      await waitFor(() => screen.getByDisplayValue("Brief"));

      fireEvent.click(screen.getByRole("button", { name: /templateAccent/i }));

      expect(screen.getByTestId("color-palette")).toBeInTheDocument();
    });
  });

  describe("Layout-Auswahl Kreativ", () => {
    beforeEach(() => {
      localStorage.setItem("jobtrix_profile", JSON.stringify(mockProfile));
    });

    it("zeigt Template-Option Kreativ zusätzlich zu den anderen Layouts", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ coverLetter: "Brief", cv: "CV", emailSubject: "Betr" }),
      });

      render(<GenerateForm />);
      await userEvent.type(screen.getByRole("textbox", { name: JOB_POSTING }), "Stelle");
      fireEvent.click(screen.getByRole("button", { name: GENERATE_BTN }));
      await waitFor(() => screen.getByDisplayValue("Brief"));

      const creativeBtn = screen.getByRole("button", { name: /templateCreative/i });
      expect(creativeBtn).toBeInTheDocument();
      expect(creativeBtn).toHaveAttribute("aria-pressed", "false");
    });

    it("sendet 'creative' an /api/generate wenn Kreativ ausgewählt ist", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ coverLetter: "Brief", cv: "CV", emailSubject: "Betr" }),
      });

      render(<GenerateForm />);
      await userEvent.type(screen.getByRole("textbox", { name: JOB_POSTING }), "Stelle");
      fireEvent.click(screen.getByRole("button", { name: GENERATE_BTN }));
      await waitFor(() => screen.getByDisplayValue("Brief"));

      fireEvent.click(screen.getByRole("button", { name: /templateCreative/i }));
      expect(screen.getByRole("button", { name: /templateCreative/i })).toHaveAttribute("aria-pressed", "true");

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ coverLetter: "Neuer Brief", cv: "Neues CV", emailSubject: "Betr2" }),
      });
      fireEvent.click(screen.getByRole("button", { name: GENERATE_BTN }));
      await waitFor(() => screen.getByDisplayValue("Neuer Brief"));

      const lastCall = (global.fetch as jest.Mock).mock.calls.at(-1) as [string, RequestInit];
      const body = JSON.parse(lastCall[1].body as string);
      expect(body.template).toBe("creative");
    });

    it("sendet die ausgewählte Akzentfarbe an /api/generate wenn Kreativ ausgewählt ist", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ coverLetter: "Brief", cv: "CV", emailSubject: "Betr" }),
      });

      render(<GenerateForm />);
      await userEvent.type(screen.getByRole("textbox", { name: JOB_POSTING }), "Stelle");
      fireEvent.click(screen.getByRole("button", { name: GENERATE_BTN }));
      await waitFor(() => screen.getByDisplayValue("Brief"));

      fireEvent.click(screen.getByRole("button", { name: /templateCreative/i }));
      fireEvent.click(screen.getByRole("button", { name: "Farbe #1A5C38" }));

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ coverLetter: "Neuer Brief", cv: "Neues CV", emailSubject: "Betr2" }),
      });
      fireEvent.click(screen.getByRole("button", { name: GENERATE_BTN }));
      await waitFor(() => screen.getByDisplayValue("Neuer Brief"));

      const lastCall = (global.fetch as jest.Mock).mock.calls.at(-1) as [string, RequestInit];
      const body = JSON.parse(lastCall[1].body as string);
      expect(body.accentColor).toBe("#1A5C38");
    });

    it("zeigt Akzentfarben-Palette wenn Kreativ-Template aktiv ist", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ coverLetter: "Brief", cv: "CV", emailSubject: "Betr" }),
      });

      render(<GenerateForm />);
      await userEvent.type(screen.getByRole("textbox", { name: JOB_POSTING }), "Stelle");
      fireEvent.click(screen.getByRole("button", { name: GENERATE_BTN }));
      await waitFor(() => screen.getByDisplayValue("Brief"));

      fireEvent.click(screen.getByRole("button", { name: /templateCreative/i }));

      expect(screen.getByTestId("color-palette")).toBeInTheDocument();
    });
  });

  describe("Bestätigungs-Checkboxen vor PDF-Download", () => {
    beforeEach(() => {
      localStorage.setItem("jobtrix_profile", JSON.stringify(mockProfile));
    });

    async function generate() {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ coverLetter: "Brief", cv: "CV", emailSubject: "Betr" }),
      });
      render(<GenerateForm />);
      await userEvent.type(screen.getByRole("textbox", { name: JOB_POSTING }), "Stelle");
      fireEvent.click(screen.getByRole("button", { name: GENERATE_BTN }));
      await waitFor(() => screen.getByDisplayValue("Brief"));
    }

    it("zeigt Bestätigungs-Checkbox unter dem Anschreiben-Textfeld", async () => {
      await generate();
      expect(screen.getByTestId("cover-letter-agree-checkbox")).toBeInTheDocument();
    });

    it("zeigt eine separate Bestätigungs-Checkbox unter dem Lebenslauf-Textfeld", async () => {
      await generate();
      const coverLetterCheckbox = screen.getByTestId("cover-letter-agree-checkbox");
      const cvCheckbox = screen.getByTestId("cv-agree-checkbox");
      expect(cvCheckbox).toBeInTheDocument();
      expect(cvCheckbox).not.toBe(coverLetterCheckbox);
    });

    it("'Anschreiben als PDF' ist deaktiviert bis die Checkbox angehakt wird", async () => {
      await generate();
      const pdfButton = screen.getByRole("button", { name: /coverLetterPdfButton/i });
      expect(pdfButton).toBeDisabled();

      fireEvent.click(screen.getByTestId("cover-letter-agree-checkbox"));

      expect(pdfButton).toBeEnabled();
    });

    it("'Lebenslauf als PDF' ist deaktiviert bis die Checkbox angehakt wird", async () => {
      await generate();
      const pdfButton = screen.getByRole("button", { name: /cvPdfButton/i });
      expect(pdfButton).toBeDisabled();

      fireEvent.click(screen.getByTestId("cv-agree-checkbox"));

      expect(pdfButton).toBeEnabled();
    });

    it("setzt Checkbox und PDF-Button zurück, wenn der Anschreiben-Text nach dem Anhaken bearbeitet wird", async () => {
      await generate();

      const checkbox = screen.getByTestId("cover-letter-agree-checkbox");
      const pdfButton = screen.getByRole("button", { name: /coverLetterPdfButton/i });
      fireEvent.click(checkbox);
      expect(pdfButton).toBeEnabled();

      const textarea = screen.getByDisplayValue("Brief");
      await userEvent.type(textarea, " zusätzlich");

      expect(checkbox).not.toBeChecked();
      expect(pdfButton).toBeDisabled();
    });

    it("setzt Checkbox und PDF-Button zurück, wenn der Lebenslauf-Text nach dem Anhaken bearbeitet wird", async () => {
      await generate();

      const checkbox = screen.getByTestId("cv-agree-checkbox");
      const pdfButton = screen.getByRole("button", { name: /cvPdfButton/i });
      fireEvent.click(checkbox);
      expect(pdfButton).toBeEnabled();

      const textarea = screen.getByDisplayValue("CV");
      await userEvent.type(textarea, " zusätzlich");

      expect(checkbox).not.toBeChecked();
      expect(pdfButton).toBeDisabled();
    });
  });
});
