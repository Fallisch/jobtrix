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
      expect(profile?.interests).toEqual([{ label: "Reisen", value: 60 }]);
    });
  });

  it("zeigt pro Qualifikations-Chip einen Slider an", async () => {
    const user = userEvent.setup();
    render(<ProfileForm />);

    await user.type(screen.getByPlaceholderText(/typescript/i), "TypeScript");
    await user.click(screen.getByRole("button", { name: /^hinzufügen$/i }));

    const slider = screen.getByRole("slider", { name: /typescript/i });
    expect(slider).toBeInTheDocument();
  });

  it("speichert den Slider-Wert einer Qualifikation in localStorage", async () => {
    const user = userEvent.setup();
    render(<ProfileForm />);

    await user.type(screen.getByLabelText(/name/i), "Max Mustermann");
    await user.type(screen.getByPlaceholderText(/institution/i), "TU Berlin");
    await user.type(screen.getByPlaceholderText(/typescript/i), "TypeScript");
    await user.click(screen.getByRole("button", { name: /^hinzufügen$/i }));

    const slider = screen.getByRole("slider", { name: /typescript/i });
    fireEvent.change(slider, { target: { value: "80" } });

    fireEvent.click(screen.getByRole("button", { name: /speichern/i }));

    await waitFor(() => {
      const profile = loadProfile();
      expect(profile?.qualifications).toEqual([{ label: "TypeScript", value: 80 }]);
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

  describe("Foto-Komprimierung", () => {
    const COMPRESSED = "data:image/jpeg;base64,compressedresult";

    class MockImage {
      width = 1000;
      height = 800;
      onload: (() => void) | null = null;
      onerror: ((e: Event) => void) | null = null;
      set src(_: string) {
        Promise.resolve().then(() => this.onload?.());
      }
    }

    let originalImage: typeof global.Image;

    beforeEach(() => {
      originalImage = global.Image;
      (global as unknown as { Image: unknown }).Image = MockImage;
      jest.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
        drawImage: jest.fn(),
      } as unknown as CanvasRenderingContext2D);
      jest.spyOn(HTMLCanvasElement.prototype, "toDataURL").mockReturnValue(COMPRESSED);
    });

    afterEach(() => {
      global.Image = originalImage;
      jest.restoreAllMocks();
    });

    it("speichert das komprimierte Foto in localStorage statt des Originals", async () => {
      const user = userEvent.setup();
      render(<ProfileForm />);

      await user.type(screen.getByLabelText(/name/i), "Max Mustermann");
      await user.type(screen.getByPlaceholderText(/institution/i), "TU Berlin");

      const file = new File(["x".repeat(3 * 1024 * 1024)], "big.jpg", { type: "image/jpeg" });
      const input = screen.getByLabelText(/foto/i);
      await user.upload(input, file);

      await waitFor(() => {
        expect(screen.getByRole("img", { name: /vorschau/i })).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole("button", { name: /speichern/i }));

      await waitFor(() => {
        const profile = loadProfile();
        expect(profile?.photo).toBe(COMPRESSED);
      });
    });
  });

  describe("Speicherfehler", () => {
    afterEach(() => jest.restoreAllMocks());

    it("zeigt Fehlermeldung wenn localStorage beim Speichern einen QuotaExceededError wirft", async () => {
      const user = userEvent.setup();
      jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
        throw new DOMException("QuotaExceededError", "QuotaExceededError");
      });

      render(<ProfileForm />);
      await user.type(screen.getByLabelText(/name/i), "Max Mustermann");
      await user.type(screen.getByPlaceholderText(/institution/i), "TU Berlin");
      fireEvent.click(screen.getByRole("button", { name: /speichern/i }));

      await waitFor(() => {
        expect(
          screen.getByText(/profil konnte nicht gespeichert werden/i)
        ).toBeInTheDocument();
      });
    });
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
