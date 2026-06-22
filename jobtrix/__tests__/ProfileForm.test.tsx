import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProfileForm from "@/components/ProfileForm";
import { ProfileData } from "@/lib/profile-storage";

const mockLocaleState: { locale: "de" | "en" } = { locale: "de" };

jest.mock("next-intl", () => {
  const de = require("@/messages/de.json");
  const en = require("@/messages/en.json");
  const dictionaries: Record<string, Record<string, unknown>> = { de, en };

  return {
    useTranslations:
      (namespace: string) =>
      (key: string, params?: Record<string, string | number>) => {
        const namespaceDict = dictionaries[mockLocaleState.locale][namespace];
        const value = key
          .split(".")
          .reduce<unknown>(
            (acc, part) => (acc as Record<string, unknown> | undefined)?.[part],
            namespaceDict
          );
        if (typeof value !== "string") return key;
        if (!params) return value;
        return Object.entries(params).reduce(
          (acc, [k, v]) => acc.replaceAll(`{${k}}`, String(v)),
          value
        );
      },
  };
});

const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useParams: () => ({ locale: mockLocaleState.locale }),
}));

function setLocale(locale: "de" | "en") {
  mockLocaleState.locale = locale;
}

const emptyProfile: ProfileData = {
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
};

type AccessData = { package: "none" | "limited" | "lifetime"; validUntil: string | null };

function mockFetch({
  getProfile = emptyProfile,
  getAccess = { package: "none", validUntil: null },
  postOk = true,
}: { getProfile?: ProfileData; getAccess?: AccessData; postOk?: boolean } = {}) {
  global.fetch = jest.fn((url: string, options?: RequestInit) => {
    if (!options || options.method === undefined) {
      if (url.toString().includes("/api/access")) {
        return Promise.resolve({ ok: true, json: async () => getAccess } as Response);
      }
      return Promise.resolve({ ok: true, json: async () => getProfile } as Response);
    }
    return Promise.resolve({ ok: postOk, json: async () => ({}) } as Response);
  }) as jest.Mock;
}

function findPostBody() {
  const postCall = (global.fetch as jest.Mock).mock.calls.find(
    ([, options]) => options?.method === "POST"
  );
  return JSON.parse(postCall[1].body);
}

beforeEach(() => {
  setLocale("de");
  mockFetch();
  mockPush.mockClear();
  sessionStorage.clear();
});

describe("ProfileForm", () => {
  it("rendert alle Pflichtfelder", async () => {
    render(<ProfileForm />);
    await waitFor(() => {});
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/adresse/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/geburtsdatum/i)).toBeInTheDocument();
  });

  it("zeigt mindestens ein leeres Ausbildungsfeld an", async () => {
    render(<ProfileForm />);
    await waitFor(() => {});
    expect(screen.getByPlaceholderText(/institution/i)).toBeInTheDocument();
  });

  it("zeigt einen übersetzten Button 'Datei auswählen' für den Foto-Upload", async () => {
    render(<ProfileForm />);
    await waitFor(() => {});
    expect(screen.getByRole("button", { name: "Datei auswählen" })).toBeInTheDocument();
  });

  it("zeigt Fehlermeldung wenn Speichern ohne Name versucht wird", async () => {
    render(<ProfileForm />);
    fireEvent.click(screen.getByRole("button", { name: /speichern/i }));
    await waitFor(() => {
      expect(screen.getByText(/name ist erforderlich/i)).toBeInTheDocument();
    });
  });

  it("erlaubt Speichern ohne Ausbildungseinträge wenn Name vorhanden", async () => {
    const user = userEvent.setup();
    render(<ProfileForm />);
    fireEvent.click(screen.getByRole("button", { name: /entfernen/i }));
    await user.type(screen.getByLabelText(/name/i), "Max Mustermann");
    fireEvent.click(screen.getByRole("button", { name: /speichern/i }));
    await waitFor(() => {
      expect(findPostBody()).toBeDefined();
    });
  });

  it("speichert das Profil per POST an /api/profile bei validen Daten", async () => {
    const user = userEvent.setup();
    render(<ProfileForm />);

    await user.type(screen.getByLabelText(/name/i), "Max Mustermann");
    await user.type(screen.getByPlaceholderText(/institution/i), "TU Berlin");

    fireEvent.click(screen.getByRole("button", { name: /speichern/i }));

    await waitFor(() => {
      const body = findPostBody();
      expect(body.name).toBe("Max Mustermann");
      expect(body.education[0].institution).toBe("TU Berlin");
    });
  });

  it("fügt einen neuen Ausbildungseintrag hinzu", async () => {
    render(<ProfileForm />);
    await waitFor(() => {});
    const before = screen.getAllByPlaceholderText(/institution/i).length;
    fireEvent.click(screen.getByRole("button", { name: /ausbildung hinzufügen/i }));
    expect(screen.getAllByPlaceholderText(/institution/i).length).toBe(before + 1);
  });

  describe("Berufserfahrung", () => {
    it("zeigt anfangs keine Berufserfahrungsfelder an, da das Feld optional ist", async () => {
      render(<ProfileForm />);
      await waitFor(() => {});
      expect(screen.queryByPlaceholderText(/^firma$/i)).not.toBeInTheDocument();
      expect(screen.getByRole("button", { name: /berufserfahrung hinzufügen/i })).toBeInTheDocument();
    });

    it("fügt einen Berufserfahrungseintrag hinzu, befüllt ihn und entfernt ihn wieder", async () => {
      const user = userEvent.setup();
      render(<ProfileForm />);
      await waitFor(() => {});

      await user.click(screen.getByRole("button", { name: /berufserfahrung hinzufügen/i }));

      await user.type(screen.getByPlaceholderText(/^firma$/i), "Acme GmbH");
      await user.type(screen.getByPlaceholderText(/^position$/i), "Entwickler");
      await user.type(screen.getByPlaceholderText(/^zeitraum$/i), "01/2020 - 12/2022");
      await user.type(screen.getByPlaceholderText(/^aufgaben$/i), "Backend-Entwicklung");

      expect(screen.getByDisplayValue("Acme GmbH")).toBeInTheDocument();

      const entry = screen.getByPlaceholderText(/^firma$/i).closest("div") as HTMLElement;
      await user.click(within(entry).getByRole("button", { name: /entfernen/i }));

      expect(screen.queryByPlaceholderText(/^firma$/i)).not.toBeInTheDocument();
    });

    it("speichert Berufserfahrungseinträge per POST an /api/profile", async () => {
      const user = userEvent.setup();
      render(<ProfileForm />);
      await waitFor(() => {});

      await user.type(screen.getByLabelText(/name/i), "Max Mustermann");
      await user.type(screen.getByPlaceholderText(/institution/i), "TU Berlin");

      await user.click(screen.getByRole("button", { name: /berufserfahrung hinzufügen/i }));
      await user.type(screen.getByPlaceholderText(/^firma$/i), "Acme GmbH");
      await user.type(screen.getByPlaceholderText(/^position$/i), "Entwickler");
      await user.type(screen.getByPlaceholderText(/^zeitraum$/i), "01/2020 - 12/2022");
      await user.type(screen.getByPlaceholderText(/^aufgaben$/i), "Backend-Entwicklung");

      fireEvent.click(screen.getByRole("button", { name: /speichern/i }));

      await waitFor(() => {
        const body = findPostBody();
        expect(body.experience).toEqual([
          { id: expect.any(String), company: "Acme GmbH", position: "Entwickler", period: "01/2020 - 12/2022", tasks: "Backend-Entwicklung" },
        ]);
      });
    });

    it("lädt vorhandene Berufserfahrungseinträge von der API", async () => {
      mockFetch({
        getProfile: {
          ...emptyProfile,
          experience: [
            { id: "1", company: "Beta AG", position: "Senior Entwickler", period: "01/2023 - heute", tasks: "Teamleitung" },
          ],
        },
      });

      render(<ProfileForm />);

      expect(await screen.findByDisplayValue("Beta AG")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Senior Entwickler")).toBeInTheDocument();
      expect(screen.getByDisplayValue("01/2023 - heute")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Teamleitung")).toBeInTheDocument();
    });

    it("speichert ein Profil ohne Berufserfahrungseinträge weiterhin fehlerfrei", async () => {
      const user = userEvent.setup();
      render(<ProfileForm />);
      await waitFor(() => {});

      await user.type(screen.getByLabelText(/name/i), "Max Mustermann");
      await user.type(screen.getByPlaceholderText(/institution/i), "TU Berlin");

      fireEvent.click(screen.getByRole("button", { name: /speichern/i }));

      await waitFor(() => {
        const body = findPostBody();
        expect(body.experience).toEqual([]);
      });
    });
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

  it("speichert persönliche Interessen per POST an /api/profile", async () => {
    const user = userEvent.setup();
    render(<ProfileForm />);

    await user.type(screen.getByLabelText(/name/i), "Max Mustermann");
    await user.type(screen.getByPlaceholderText(/institution/i), "TU Berlin");
    await user.type(screen.getByPlaceholderText(/fotografie/i), "Reisen");
    await user.click(screen.getByRole("button", { name: /^interesse hinzufügen$/i }));

    fireEvent.click(screen.getByRole("button", { name: /speichern/i }));

    await waitFor(() => {
      const body = findPostBody();
      expect(body.interests).toEqual([{ label: "Reisen", value: 60 }]);
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

  it("speichert den Slider-Wert einer Qualifikation per POST an /api/profile", async () => {
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
      const body = findPostBody();
      expect(body.qualifications).toEqual([{ label: "TypeScript", value: 80 }]);
    });
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

    it("sendet das komprimierte Foto per POST statt des Originals", async () => {
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
        const body = findPostBody();
        expect(body.photo).toBe(COMPRESSED);
      });
    });
  });

  describe("Speicherfehler", () => {
    it("zeigt Fehlermeldung wenn das Speichern per API fehlschlägt", async () => {
      const user = userEvent.setup();
      mockFetch({ postOk: false });

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

  it("lädt vorhandenes Profil von der API", async () => {
    mockFetch({
      getProfile: {
        ...emptyProfile,
        name: "Erika Musterfrau",
        education: [{ id: "1", institution: "HU Berlin", degree: "M.A.", year: "2020" }],
      },
    });

    render(<ProfileForm />);

    expect(await screen.findByDisplayValue("Erika Musterfrau")).toBeInTheDocument();
    expect(screen.getByDisplayValue("HU Berlin")).toBeInTheDocument();
  });

  describe("Sprachpräfix nach Speichern (Issue #25)", () => {
    it("navigiert nach erfolgreichem Speichern unter /en/profile zu /en/generate", async () => {
      setLocale("en");
      const user = userEvent.setup();
      render(<ProfileForm />);

      await user.type(screen.getByLabelText(/^name/i), "Max Mustermann");
      await user.type(screen.getByPlaceholderText(/^institution$/i), "TU Berlin");
      await user.click(screen.getByRole("button", { name: /^save$/i }));

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/en/generate");
      });
    });

    it("navigiert nach erfolgreichem Speichern unter /de/profile zu /de/generate", async () => {
      const user = userEvent.setup();
      render(<ProfileForm />);

      await user.type(screen.getByLabelText(/name/i), "Max Mustermann");
      await user.type(screen.getByPlaceholderText(/institution/i), "TU Berlin");
      await user.click(screen.getByRole("button", { name: /speichern/i }));

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/de/generate");
      });
    });
  });

  describe("Zugang-Gültigkeitsdatum (Issue #22)", () => {
    it("zeigt das Gültigkeitsdatum bei aktivem zeitlich begrenztem Zugang an", async () => {
      mockFetch({ getAccess: { package: "limited", validUntil: "2026-12-31T00:00:00.000Z" } });

      render(<ProfileForm />);

      expect(await screen.findByText(/gültig bis/i)).toBeInTheDocument();
      expect(screen.getByText(/31\.12\.2026/)).toBeInTheDocument();
    });

    it("zeigt keinen Hinweis auf ein Gültigkeitsdatum bei Lifetime-Zugang", async () => {
      mockFetch({ getAccess: { package: "lifetime", validUntil: null } });

      render(<ProfileForm />);
      await waitFor(() => {});

      expect(screen.queryByText(/gültig bis/i)).not.toBeInTheDocument();
    });

    it("zeigt keinen Hinweis auf ein Gültigkeitsdatum ohne aktiven Zugang", async () => {
      mockFetch({ getAccess: { package: "none", validUntil: null } });

      render(<ProfileForm />);
      await waitFor(() => {});

      expect(screen.queryByText(/gültig bis/i)).not.toBeInTheDocument();
    });
  });

  describe("Englisch (AC1)", () => {
    beforeEach(() => setLocale("en"));

    it("zeigt Titel und Hauptfelder auf Englisch", async () => {
      render(<ProfileForm />);
      await waitFor(() => {});
      expect(screen.getByRole("heading", { level: 1, name: /^profile$/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/^name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^address$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^phone$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/date of birth/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^photo$/i)).toBeInTheDocument();
    });

    it("zeigt einen übersetzten Button 'Choose file' für den Foto-Upload", async () => {
      render(<ProfileForm />);
      await waitFor(() => {});
      expect(screen.getByRole("button", { name: "Choose file" })).toBeInTheDocument();
    });

    it("zeigt die Ausbildungs-Sektion auf Englisch", async () => {
      render(<ProfileForm />);
      await waitFor(() => {});
      expect(screen.getByRole("heading", { name: /education \*/i })).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/^degree$/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/^year$/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /^remove$/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /add education/i })).toBeInTheDocument();
    });

    it("zeigt die Berufserfahrungs-Sektion auf Englisch", async () => {
      const user = userEvent.setup();
      render(<ProfileForm />);
      await waitFor(() => {});

      expect(screen.getByRole("heading", { name: /work experience/i })).toBeInTheDocument();
      const addButton = screen.getByRole("button", { name: /^add work experience$/i });
      expect(addButton).toBeInTheDocument();

      await user.click(addButton);
      expect(screen.getByPlaceholderText(/^company$/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/^position$/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/^period$/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/^tasks$/i)).toBeInTheDocument();
    });

    it("zeigt Qualifikationen und Interessen auf Englisch", async () => {
      render(<ProfileForm />);
      await waitFor(() => {});
      expect(screen.getByRole("heading", { name: /qualifications/i })).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/^e\.g\. typescript$/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /^add$/i })).toBeInTheDocument();
      expect(screen.getByRole("heading", { name: /personal interests/i })).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/^e\.g\. photography$/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /^add interest$/i })).toBeInTheDocument();
    });

    it("übersetzt das Entfernen-Label für Qualifikations-Chips ins Englische", async () => {
      const user = userEvent.setup();
      render(<ProfileForm />);
      await user.type(screen.getByPlaceholderText(/^e\.g\. typescript$/i), "TypeScript");
      await user.click(screen.getByRole("button", { name: /^add$/i }));
      expect(screen.getByRole("button", { name: /^remove typescript$/i })).toBeInTheDocument();
    });

    it("zeigt den Speichern-Button und Validierungsfehler auf Englisch", async () => {
      render(<ProfileForm />);
      await waitFor(() => {});
      expect(screen.getByRole("button", { name: /^save$/i })).toBeInTheDocument();

      fireEvent.click(screen.getByRole("button", { name: /^save$/i }));
      await waitFor(() => {
        expect(screen.getByText(/^name is required$/i)).toBeInTheDocument();
      });
    });

    it("zeigt den Speicherfehler auf Englisch wenn das Speichern per API fehlschlägt", async () => {
      const user = userEvent.setup();
      mockFetch({ postOk: false });

      render(<ProfileForm />);
      await user.type(screen.getByLabelText(/^name/i), "Max Mustermann");
      await user.type(screen.getByPlaceholderText(/^institution$/i), "TU Berlin");
      fireEvent.click(screen.getByRole("button", { name: /^save$/i }));

      await waitFor(() => {
        expect(screen.getByText(/^could not save profile\. please try again\.$/i)).toBeInTheDocument();
      });
    });
  });
});
