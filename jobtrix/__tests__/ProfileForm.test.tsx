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
      })
    );
    render(<ProfileForm />);
    expect(screen.getByDisplayValue("Erika Musterfrau")).toBeInTheDocument();
    expect(screen.getByDisplayValue("HU Berlin")).toBeInTheDocument();
  });
});
