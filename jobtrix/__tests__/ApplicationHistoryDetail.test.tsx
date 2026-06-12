import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import ApplicationHistoryDetail from "@/components/ApplicationHistoryDetail";
import { pdf } from "@react-pdf/renderer";

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

jest.mock("next/navigation", () => ({
  useParams: () => ({ locale: "de" }),
}));

global.fetch = jest.fn();

const profileSnapshot = {
  name: "Max Mustermann",
  address: "Musterstraße 1",
  email: "",
  phone: "",
  birthdate: "1990-01-01",
  photo: null,
  education: [],
  qualifications: [],
  interests: [],
};

const entry = {
  id: "entry-1",
  createdAt: "2026-06-10T10:00:00.000Z",
  jobTitle: "Senior Developer",
  companyName: "Acme GmbH",
  emailSubject: "Bewerbung als Senior Developer",
  coverLetter: "Sehr geehrte Damen und Herren",
  cv: "Max Mustermann – Lebenslauf",
  profileSnapshot,
};

beforeEach(() => {
  (global.fetch as jest.Mock).mockReset();
  (pdf as jest.Mock).mockClear();
  global.URL.createObjectURL = jest.fn(() => "blob:mock-url");
  global.URL.revokeObjectURL = jest.fn();
});

describe("ApplicationHistoryDetail", () => {
  it("zeigt Anschreiben, E-Mail-Entwurf und Lebenslauf eines Eintrags schreibgeschützt an", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true, json: () => Promise.resolve(entry) });

    render(<ApplicationHistoryDetail id="entry-1" />);

    await waitFor(() => screen.getByRole("heading", { level: 1 }));
    expect(screen.getByText(/Acme GmbH/)).toBeInTheDocument();
    expect(screen.getAllByText("Sehr geehrte Damen und Herren").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Max Mustermann – Lebenslauf")).toBeInTheDocument();
    expect(screen.getByText("Bewerbung als Senior Developer")).toBeInTheDocument();

    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  it("zeigt Datum UND Uhrzeit der Erstellung an", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true, json: () => Promise.resolve(entry) });

    render(<ApplicationHistoryDetail id="entry-1" />);

    await waitFor(() => screen.getByRole("heading", { level: 1 }));
    expect(screen.getByText(/\d{1,2}:\d{2}/)).toBeInTheDocument();
  });

  it("löst beim Klick auf 'PDF erneut herunterladen' den PDF-Export von Anschreiben und Lebenslauf mit dem gespeicherten Schnappschuss aus", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true, json: () => Promise.resolve(entry) });

    render(<ApplicationHistoryDetail id="entry-1" />);

    await waitFor(() => screen.getByRole("heading", { level: 1 }));
    fireEvent.click(screen.getByRole("button", { name: /pdfButton/i }));

    await waitFor(() => {
      expect(global.URL.createObjectURL).toHaveBeenCalledTimes(2);
    });
  });

  it("verwendet beim PDF-Re-Export das im Eintrag gespeicherte Layout 'modern'", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true, json: () => Promise.resolve({ ...entry, template: "modern" }) });

    render(<ApplicationHistoryDetail id="entry-1" />);

    await waitFor(() => screen.getByRole("heading", { level: 1 }));
    fireEvent.click(screen.getByRole("button", { name: /pdfButton/i }));

    await waitFor(() => {
      expect(global.URL.createObjectURL).toHaveBeenCalledTimes(2);
    });

    const calls = (pdf as jest.Mock).mock.calls;
    expect(calls[0][0].props.template).toBe("modern");
    expect(calls[1][0].props.template).toBe("modern");
  });

  it("zeigt einen Hinweis mit Link zur Übersicht, wenn der Eintrag nicht gefunden wird", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: false, status: 404, json: () => Promise.resolve({ error: "not_found" }) });

    render(<ApplicationHistoryDetail id="unknown-id" />);

    await waitFor(() => screen.getByText("notFound"));
    const link = screen.getByRole("link", { name: /backLink/i });
    expect(link).toHaveAttribute("href", "/de/application-history");
  });
});
