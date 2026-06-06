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
