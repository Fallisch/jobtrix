import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import ApplicationHistoryList from "@/components/ApplicationHistoryList";
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

const entries = [
  {
    id: "entry-2",
    createdAt: "2026-06-10T10:00:00.000Z",
    jobTitle: "Senior Developer",
    companyName: "Acme GmbH",
    emailSubject: "Bewerbung als Senior Developer",
    coverLetter: "Sehr geehrte Damen und Herren, ".repeat(10),
    cv: "Lebenslauf 2",
    profileSnapshot,
  },
  {
    id: "entry-1",
    createdAt: "2026-06-01T10:00:00.000Z",
    jobTitle: "Junior Developer",
    companyName: null,
    emailSubject: "Bewerbung als Junior Developer",
    coverLetter: "Kurzer Brief",
    cv: "Lebenslauf 1",
    profileSnapshot,
  },
];

beforeEach(() => {
  (global.fetch as jest.Mock).mockReset();
  (pdf as jest.Mock).mockClear();
  global.URL.createObjectURL = jest.fn(() => "blob:mock-url");
  global.URL.revokeObjectURL = jest.fn();
});

describe("ApplicationHistoryList", () => {
  it("zeigt einen Leerzustand mit Hinweistext und Link zur Generierungs-Seite, wenn keine Bewerbungen vorhanden sind", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true, json: () => Promise.resolve([]) });

    render(<ApplicationHistoryList />);

    await waitFor(() => screen.getByText("emptyState"));
    const link = screen.getByRole("link", { name: /emptyStateLink/i });
    expect(link).toHaveAttribute("href", "/de/generate");
  });

  it("zeigt für jeden Eintrag Stellenbezug, Erstellungsdatum, Anschreiben-Auszug und Buttons 'Anzeigen' und 'PDF erneut herunterladen'", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true, json: () => Promise.resolve(entries) });

    render(<ApplicationHistoryList />);

    await waitFor(() => screen.getByText(/Senior Developer/));
    expect(screen.getByText(/Acme GmbH/)).toBeInTheDocument();
    expect(screen.getByText(/Junior Developer/)).toBeInTheDocument();
    expect(screen.getByText(/Kurzer Brief/)).toBeInTheDocument();
    expect(screen.getAllByText(/2026/).length).toBeGreaterThan(0);

    const viewLinks = screen.getAllByRole("link", { name: /viewButton/i });
    expect(viewLinks[0]).toHaveAttribute("href", "/de/application-history/entry-2");
    expect(viewLinks[1]).toHaveAttribute("href", "/de/application-history/entry-1");

    expect(screen.getAllByRole("button", { name: /pdfButton/i })).toHaveLength(2);
  });

  it("löst beim Klick auf 'PDF erneut herunterladen' den erneuten PDF-Export von Anschreiben und Lebenslauf aus", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true, json: () => Promise.resolve(entries) });

    render(<ApplicationHistoryList />);

    await waitFor(() => screen.getByText(/Senior Developer/));
    const pdfButtons = screen.getAllByRole("button", { name: /pdfButton/i });
    fireEvent.click(pdfButtons[0]);

    await waitFor(() => {
      expect(global.URL.createObjectURL).toHaveBeenCalledTimes(2);
    });
  });

  it("verwendet beim PDF-Re-Export das im Eintrag gespeicherte Layout 'modern'", async () => {
    const entriesWithModern = [{ ...entries[0], template: "modern" as const }, entries[1]];
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true, json: () => Promise.resolve(entriesWithModern) });

    render(<ApplicationHistoryList />);

    await waitFor(() => screen.getByText(/Senior Developer/));
    const pdfButtons = screen.getAllByRole("button", { name: /pdfButton/i });
    fireEvent.click(pdfButtons[0]);

    await waitFor(() => {
      expect(global.URL.createObjectURL).toHaveBeenCalledTimes(2);
    });

    const calls = (pdf as jest.Mock).mock.calls;
    expect(calls[0][0].props.template).toBe("modern");
    expect(calls[1][0].props.template).toBe("modern");
  });
});
