/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProfileForm from "@/components/ProfileForm";
import OnboardingForm from "@/components/OnboardingForm";

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

const mockPush = jest.fn();
const mockNavigate = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useParams: () => ({ locale: "de" }),
}));
jest.mock("next-auth/react", () => ({
  useSession: () => ({ data: { user: { email: "a@b.de" }, expires: "" }, status: "authenticated" }),
}));
jest.mock("@/lib/navigate", () => ({ navigate: (...a: unknown[]) => mockNavigate(...a) }));

jest.mock("@/lib/image-compress", () => ({
  compressImage: jest.fn().mockResolvedValue("data:image/jpeg;base64,ORIGINAL"),
}));

const removeBackgroundMock = jest.fn().mockResolvedValue("data:image/jpeg;base64,REMOVED");
jest.mock("@/lib/remove-background", () => ({
  removeBackground: (...args: unknown[]) => removeBackgroundMock(...args),
}));

beforeEach(() => {
  (global.fetch as jest.Mock) = jest.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });
  removeBackgroundMock.mockClear();
  mockNavigate.mockClear();
  localStorage.clear();
  sessionStorage.clear();
});

function fileInput(): HTMLInputElement {
  const input = document.querySelector('input[type="file"]') as HTMLInputElement;
  return input;
}

describe("ProfileForm – Foto optional + Hintergrund-Entfernung", () => {
  it("kennzeichnet das Foto als optional", () => {
    render(<ProfileForm />);
    expect(screen.getByText(/photoOptionalHint/i)).toBeInTheDocument();
  });

  it("zeigt den 'Hintergrund entfernen'-Button erst nach Auswahl eines Fotos", async () => {
    render(<ProfileForm />);
    expect(screen.queryByTestId("remove-bg-button")).not.toBeInTheDocument();

    await userEvent.upload(fileInput(), new File(["x"], "p.jpg", { type: "image/jpeg" }));

    expect(await screen.findByTestId("remove-bg-button")).toBeInTheDocument();
  });

  it("erzeugt beim Klick ein freigestelltes Foto und lässt zwischen Original und Freigestellt wählen", async () => {
    render(<ProfileForm />);
    await userEvent.upload(fileInput(), new File(["x"], "p.jpg", { type: "image/jpeg" }));

    const img = (await screen.findAllByRole("img")).find((i) => i.getAttribute("alt") === "photoPreviewAlt") as HTMLImageElement;
    expect(img).toHaveAttribute("src", "data:image/jpeg;base64,ORIGINAL");

    fireEvent.click(await screen.findByTestId("remove-bg-button"));

    await waitFor(() => {
      expect(removeBackgroundMock).toHaveBeenCalledWith("data:image/jpeg;base64,ORIGINAL");
    });

    // Vorschau zeigt nun das freigestellte Foto.
    await waitFor(() => {
      const updated = screen.getAllByRole("img").find((i) => i.getAttribute("alt") === "photoPreviewAlt") as HTMLImageElement;
      expect(updated).toHaveAttribute("src", "data:image/jpeg;base64,REMOVED");
    });

    // Original wieder wählbar.
    const toggle = screen.getByTestId("photo-variant-toggle");
    fireEvent.click(toggle.querySelector("button")!); // erster Button = Original
    await waitFor(() => {
      const reverted = screen.getAllByRole("img").find((i) => i.getAttribute("alt") === "photoPreviewAlt") as HTMLImageElement;
      expect(reverted).toHaveAttribute("src", "data:image/jpeg;base64,ORIGINAL");
    });
  });

  it("zeigt während der Verarbeitung eine sichtbare Rückmeldung", async () => {
    let resolveFn: (v: string) => void = () => {};
    removeBackgroundMock.mockImplementationOnce(() => new Promise<string>((res) => { resolveFn = res; }));

    render(<ProfileForm />);
    await userEvent.upload(fileInput(), new File(["x"], "p.jpg", { type: "image/jpeg" }));
    fireEvent.click(await screen.findByTestId("remove-bg-button"));

    expect(await screen.findByTestId("bg-processing")).toBeInTheDocument();

    resolveFn("data:image/jpeg;base64,REMOVED");
    await waitFor(() => expect(screen.queryByTestId("bg-processing")).not.toBeInTheDocument());
  });
});

describe("OnboardingForm – Foto optional + Hintergrund-Entfernung", () => {
  async function gotoPhotoStep() {
    render(<OnboardingForm />);
    await userEvent.type(screen.getByRole("textbox", { name: /step1Title/i }), "Max");
    for (let i = 0; i < 5; i++) {
      fireEvent.click(screen.getByRole("button", { name: /^next$/i }));
    }
    expect(screen.getByText(/step6Title/i)).toBeInTheDocument();
  }

  it("kennzeichnet den Foto-Schritt als optional und ist überspringbar", async () => {
    await gotoPhotoStep();
    expect(screen.getByText(/step6Optional/i)).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("skip-photo-button"));
    // Überspringen führt ohne Foto zum nächsten Schritt.
    expect(screen.getByText(/step7Title/i)).toBeInTheDocument();
  });

  it("bietet nach Foto-Auswahl die lokale Hintergrund-Entfernung an", async () => {
    await gotoPhotoStep();
    await userEvent.upload(fileInput(), new File(["x"], "p.jpg", { type: "image/jpeg" }));

    fireEvent.click(await screen.findByTestId("remove-bg-button"));
    await waitFor(() => expect(removeBackgroundMock).toHaveBeenCalledWith("data:image/jpeg;base64,ORIGINAL"));
    expect(await screen.findByTestId("photo-variant-toggle")).toBeInTheDocument();
  });
});
