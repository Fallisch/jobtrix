import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProfileForm from "@/components/ProfileForm";
import { loadProfile } from "@/lib/profile-storage";

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

beforeEach(() => localStorage.clear());

describe("ProfileForm", () => {
  it("rendert alle Pflichtfelder", () => {
    render(<ProfileForm />);
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/adresse/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/geburtsdatum/i)).toBeInTheDocument();
  });

  it("zeigt mindestens ein leeres Ausbildungsfeld an", () => {
    render(<ProfileForm />);
    expect(screen.getByPlaceholderText(/institution/i)).toBeInTheDocument();
  });

  it("zeigt Fehlermeldung wenn Speichern ohne Name versucht wird", async () => {
    render(<ProfileForm />);
    fireEvent.click(screen.getByRole("button", { name: /speichern/i }));
    await waitFor(() => {
      expect(screen.getByText(/name ist erforderlich/i)).toBeInTheDocument();
    });
  });

  it("zeigt Fehlermeldung wenn alle Ausbildungseinträge entfernt wurden", async () => {
    render(<ProfileForm />);
    fireEvent.click(screen.getByRole("button", { name: /entfernen/i }));
    fireEvent.click(screen.getByRole("button", { name: /speichern/i }));
    await waitFor(() => {
      expect(screen.getByText(/ausbildungseintrag/i)).toBeInTheDocument();
    });
  });

  it("speichert in localStorage bei validen Daten", async () => {
    const user = userEvent.setup();
    render(<ProfileForm />);

    await user.type(screen.getByLabelText(/name/i), "Max Mustermann");
    await user.type(screen.getByPlaceholderText(/institution/i), "TU Berlin");

    fireEvent.click(screen.getByRole("button", { name: /speichern/i }));

    await waitFor(() => {
      const profile = loadProfile();
      expect(profile?.name).toBe("Max Mustermann");
      expect(profile?.education[0].institution).toBe("TU Berlin");
    });
  });

  it("fügt einen neuen Ausbildungseintrag hinzu", async () => {
    render(<ProfileForm />);
    const before = screen.getAllByPlaceholderText(/institution/i).length;
    fireEvent.click(screen.getByRole("button", { name: /ausbildung hinzufügen/i }));
    expect(screen.getAllByPlaceholderText(/institution/i).length).toBe(before + 1);
  });

  it("fügt ein persönliches Interesse hinzu und entfernt es wieder", async () => {
    const user = userEvent.setup();
    render(<ProfileForm />);

    const input = screen.getByPlaceholderText(/fotografie/i);
    await user.type(input, "Wandern");
    await user.click(screen.getByRole("button", { name: /^interesse hinzufügen$/i }));

    expect(screen.getByText("Wandern")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /wandern entfernen/i }));
    expect(screen.queryByText("Wandern")).not.toBeInTheDocument();
  });

  it("speichert persönliche Interessen in localStorage", async () => {
    const user = userEvent.setup();
    render(<ProfileForm />);

    await user.type(screen.getByLabelText(/name/i), "Max Mustermann");
    await user.type(screen.getByPlaceholderText(/institution/i), "TU Berlin");
    await user.type(screen.getByPlaceholderText(/fotografie/i), "Reisen");
    await user.click(screen.getByRole("button", { name: /^interesse hinzufügen$/i }));

    fireEvent.click(screen.getByRole("button", { name: /speichern/i }));

    await waitFor(() => {
      const profile = loadProfile();
      expect(profile?.interests).toEqual(["Reisen"]);
    });
  });

  it("rendert ein Legacy-Profil mit `strengths` statt `interests` ohne Crash und zeigt migrierte Interessen", () => {
    localStorage.setItem(
      "jobtrix_profile",
      JSON.stringify({
        name: "Lisa Altmann",
        address: "",
        birthdate: "",
        photo: null,
        education: [{ id: "1", institution: "HU Berlin", degree: "M.A.", year: "2012" }],
        qualifications: [],
        strengths: ["Reisen"],
      })
    );

    expect(() => render(<ProfileForm />)).not.toThrow();
    expect(screen.getByText("Reisen")).toBeInTheDocument();
  });

  it("lädt vorhandenes Profil aus localStorage", () => {
    localStorage.setItem(
      "jobtrix_profile",
      JSON.stringify({
        name: "Erika Musterfrau",
        address: "",
        birthdate: "",
        photo: null,
        education: [{ id: "1", institution: "HU Berlin", degree: "M.A.", year: "2020" }],
        qualifications: [],
        interests: [],
      })
    );
    render(<ProfileForm />);
    expect(screen.getByDisplayValue("Erika Musterfrau")).toBeInTheDocument();
    expect(screen.getByDisplayValue("HU Berlin")).toBeInTheDocument();
  });
});
