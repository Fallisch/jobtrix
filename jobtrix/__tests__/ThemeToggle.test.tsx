import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ThemeToggle from "@/components/ThemeToggle";
import { useTheme } from "next-themes";
import { useSession } from "next-auth/react";

jest.mock("next-themes", () => ({
  useTheme: jest.fn(),
}));

jest.mock("next-auth/react", () => ({
  useSession: jest.fn(),
}));

jest.mock("next-intl", () => {
  const de = require("@/messages/de.json");

  return {
    useTranslations:
      (namespace: string) =>
      (key: string) => {
        const namespaceDict = (de as Record<string, unknown>)[namespace] as
          | Record<string, unknown>
          | undefined;
        const value = namespaceDict?.[key];
        return typeof value === "string" ? value : key;
      },
  };
});

const mockedUseTheme = jest.mocked(useTheme);
const mockedUseSession = jest.mocked(useSession);

function mockSession(status: "authenticated" | "unauthenticated") {
  mockedUseSession.mockReturnValue({
    data: status === "authenticated" ? { user: {}, expires: "" } : null,
    status,
    update: jest.fn(),
  } as ReturnType<typeof useSession>);
}

describe("ThemeToggle", () => {
  const setTheme = jest.fn();

  beforeEach(() => {
    setTheme.mockReset();
    mockedUseTheme.mockReturnValue({
      theme: "light",
      resolvedTheme: "light",
      setTheme,
    } as unknown as ReturnType<typeof useTheme>);
    mockSession("unauthenticated");
    global.fetch = jest.fn();
  });

  it("zeigt im Hellmodus einen Button zum Wechsel in den Dunkelmodus an", () => {
    render(<ThemeToggle />);
    expect(screen.getByRole("button", { name: "Zu Dunkelmodus wechseln" })).toBeInTheDocument();
  });

  it("zeigt im Dunkelmodus einen Button zum Wechsel in den Hellmodus an", () => {
    mockedUseTheme.mockReturnValue({
      theme: "dark",
      resolvedTheme: "dark",
      setTheme,
    } as unknown as ReturnType<typeof useTheme>);

    render(<ThemeToggle />);
    expect(screen.getByRole("button", { name: "Zu Hellmodus wechseln" })).toBeInTheDocument();
  });

  it("wechselt beim Klick von Hell zu Dunkel", async () => {
    render(<ThemeToggle />);

    await userEvent.click(screen.getByRole("button", { name: "Zu Dunkelmodus wechseln" }));

    expect(setTheme).toHaveBeenCalledWith("dark");
  });

  it("wechselt beim Klick von Dunkel zu Hell", async () => {
    mockedUseTheme.mockReturnValue({
      theme: "dark",
      resolvedTheme: "dark",
      setTheme,
    } as unknown as ReturnType<typeof useTheme>);

    render(<ThemeToggle />);
    await userEvent.click(screen.getByRole("button", { name: "Zu Hellmodus wechseln" }));

    expect(setTheme).toHaveBeenCalledWith("light");
  });

  it("speichert die Präferenz nicht im Account, wenn der Nutzer nicht angemeldet ist", async () => {
    render(<ThemeToggle />);

    await userEvent.click(screen.getByRole("button", { name: "Zu Dunkelmodus wechseln" }));

    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("speichert die Präferenz im Nutzerkonto, wenn der Nutzer angemeldet ist", async () => {
    mockSession("authenticated");
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ themePreference: "light" }),
    });

    render(<ThemeToggle />);
    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    (global.fetch as jest.Mock).mockClear();

    await userEvent.click(screen.getByRole("button", { name: "Zu Dunkelmodus wechseln" }));

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/theme",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ themePreference: "dark" }),
      })
    );
  });

  it("lädt beim Start für angemeldete Nutzer die im Account gespeicherte Präferenz und wendet sie an", async () => {
    mockSession("authenticated");
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ themePreference: "dark" }),
    });

    render(<ThemeToggle />);

    await waitFor(() => expect(setTheme).toHaveBeenCalledWith("dark"));
    expect(global.fetch).toHaveBeenCalledWith("/api/theme");
  });

  it("lädt beim Start für nicht angemeldete Nutzer keine Account-Präferenz", () => {
    render(<ThemeToggle />);

    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("überschreibt die lokale Theme-Auswahl nicht wenn keine Server-Präferenz gespeichert ist", async () => {
    mockSession("authenticated");
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ themePreference: null }),
    });

    render(<ThemeToggle />);

    await waitFor(() => expect(global.fetch).toHaveBeenCalledWith("/api/theme"));
    expect(setTheme).not.toHaveBeenCalled();
  });

  it("zeigt im Hellmodus das sichtbare Textlabel 'Hell'", () => {
    render(<ThemeToggle />);
    expect(screen.getByText("Hell")).toBeInTheDocument();
  });

  it("blendet das Textlabel auf Mobile nicht per 'hidden' aus (#234)", () => {
    render(<ThemeToggle />);
    const label = screen.getByText("Hell");
    // Auf dem Handy erscheint der Toggle nur im Slide-Down-Menü; ein
    // 'hidden sm:inline' würde die Beschriftung dort komplett verstecken.
    expect(label.className).not.toContain("hidden");
  });

  it("streckt sich im Spalten-Layout (mobiles Menü) nicht über die volle Breite", () => {
    render(<ThemeToggle />);
    const button = screen.getByRole("button", { name: "Zu Dunkelmodus wechseln" });
    // w-fit verhindert, dass align-items:stretch den Button im flex-col-Menü
    // über die volle Breite zieht (#228).
    expect(button.className).toContain("w-fit");
  });

  it("zeigt im Dunkelmodus das sichtbare Textlabel 'Dunkel'", () => {
    mockedUseTheme.mockReturnValue({
      theme: "dark",
      resolvedTheme: "dark",
      setTheme,
    } as unknown as ReturnType<typeof useTheme>);

    render(<ThemeToggle />);
    expect(screen.getByText("Dunkel")).toBeInTheDocument();
  });
});
