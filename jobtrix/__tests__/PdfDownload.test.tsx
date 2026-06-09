import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import GenerateForm from "@/components/GenerateForm";
import { pdf } from "@react-pdf/renderer";

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
  address: "Musterstraße 1, 12345 Berlin",
  birthdate: "1990-01-01",
  photo: null,
  education: [{ id: "1", institution: "TU Berlin", degree: "B.Sc.", year: "2015" }],
  qualifications: ["TypeScript"],
  interests: [],
};

beforeEach(() => {
  (global.fetch as jest.Mock).mockReset();
  (pdf as jest.Mock).mockClear();
  localStorage.clear();
  localStorage.setItem("jobtrix_profile", JSON.stringify(mockProfile));

  global.URL.createObjectURL = jest.fn(() => "blob:mock-url");
  global.URL.revokeObjectURL = jest.fn();
});

async function generateResult(coverLetter = "Sehr geehrte Damen und Herren", cv = "Max Mustermann – Lebenslauf") {
  (global.fetch as jest.Mock).mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ coverLetter, cv, emailSubject: "Bewerbung" }),
  });

  render(<GenerateForm />);
  await userEvent.type(screen.getByRole("textbox", { name: /jobPostingLabel/i }), "Stelle");
  fireEvent.click(screen.getByRole("button", { name: /generateButton/i }));
  await waitFor(() => screen.getByDisplayValue(coverLetter));
}

describe("PDF-Download-Buttons", () => {
  it("zeigt 'Anschreiben als PDF'-Button nach Generierung", async () => {
    await generateResult();
    expect(screen.getByRole("button", { name: /coverLetterPdfButton/i })).toBeInTheDocument();
  });

  it("zeigt 'Lebenslauf als PDF'-Button nach Generierung", async () => {
    await generateResult();
    expect(screen.getByRole("button", { name: /cvPdfButton/i })).toBeInTheDocument();
  });
});

describe("PDF-Download-Verhalten", () => {
  it("Anschreiben-PDF-Button löst clientseitigen Download aus (kein Server-Roundtrip)", async () => {
    await generateResult("Originaltext", "CV");

    fireEvent.click(screen.getByRole("button", { name: /coverLetterPdfButton/i }));

    await waitFor(() => {
      expect(global.URL.createObjectURL).toHaveBeenCalled();
    });
    // kein zusätzlicher fetch-Aufruf für PDF-Generierung
    const fetchCallsAfterGeneration = (global.fetch as jest.Mock).mock.calls.length;
    expect(fetchCallsAfterGeneration).toBe(1); // nur der eine generate-Call
  });

  it("Anschreiben-PDF enthält bearbeiteten Text, nicht den Original-Text", async () => {
    await generateResult("Originaltext", "CV");

    const coverLetterArea = screen.getByDisplayValue("Originaltext");
    await userEvent.clear(coverLetterArea);
    await userEvent.type(coverLetterArea, "Bearbeiteter Inhalt");

    fireEvent.click(screen.getByRole("button", { name: /coverLetterPdfButton/i }));

    await waitFor(() => {
      const pdfCall = (pdf as jest.Mock).mock.calls[0]?.[0];
      expect(JSON.stringify(pdfCall)).toContain("Bearbeiteter Inhalt");
    });
  });

  it("Lebenslauf-PDF-Button löst clientseitigen Download aus", async () => {
    await generateResult("Anschreiben", "Lebenslauf-Text");

    fireEvent.click(screen.getByRole("button", { name: /cvPdfButton/i }));

    await waitFor(() => {
      expect(global.URL.createObjectURL).toHaveBeenCalled();
    });
    const fetchCallsAfterGeneration = (global.fetch as jest.Mock).mock.calls.length;
    expect(fetchCallsAfterGeneration).toBe(1);
  });

  it("Anschreiben-PDF verwendet das gewählte Template (Modern)", async () => {
    await generateResult("Brief", "CV");

    fireEvent.click(screen.getByRole("button", { name: /templateModern/i }));
    fireEvent.click(screen.getByRole("button", { name: /coverLetterPdfButton/i }));

    await waitFor(() => {
      const pdfCall = (pdf as jest.Mock).mock.calls[0]?.[0];
      expect(JSON.stringify(pdfCall)).toContain("modern");
    });
  });

  it("Lebenslauf-PDF verwendet das gewählte Template (Modern)", async () => {
    await generateResult("Brief", "CV");

    fireEvent.click(screen.getByRole("button", { name: /templateModern/i }));
    fireEvent.click(screen.getByRole("button", { name: /cvPdfButton/i }));

    await waitFor(() => {
      const pdfCall = (pdf as jest.Mock).mock.calls[0]?.[0];
      expect(JSON.stringify(pdfCall)).toContain("modern");
    });
  });

  it("Anschreiben-PDF verwendet gewählte accentColor aus der Palette", async () => {
    await generateResult("Brief", "CV");

    fireEvent.click(screen.getByRole("button", { name: /templateModern/i }));
    fireEvent.click(screen.getByRole("button", { name: /Farbe #1A5C38/i }));
    fireEvent.click(screen.getByRole("button", { name: /coverLetterPdfButton/i }));

    await waitFor(() => {
      const pdfCall = (pdf as jest.Mock).mock.calls[0]?.[0];
      expect(JSON.stringify(pdfCall)).toContain("#1A5C38");
    });
  });

  it("Lebenslauf-PDF verwendet gewählte accentColor aus der Palette", async () => {
    await generateResult("Brief", "CV");

    fireEvent.click(screen.getByRole("button", { name: /templateModern/i }));
    fireEvent.click(screen.getByRole("button", { name: /Farbe #5C1A1A/i }));
    fireEvent.click(screen.getByRole("button", { name: /cvPdfButton/i }));

    await waitFor(() => {
      const pdfCall = (pdf as jest.Mock).mock.calls[0]?.[0];
      expect(JSON.stringify(pdfCall)).toContain("#5C1A1A");
    });
  });
});
