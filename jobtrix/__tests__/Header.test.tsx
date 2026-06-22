import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Header from "@/components/Header";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "next-themes";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => "/de",
}));

jest.mock("next-themes", () => ({
  useTheme: jest.fn(),
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

jest.mock("next-auth/react", () => ({
  useSession: jest.fn(),
  signOut: jest.fn(),
}));

const mockedUseSession = jest.mocked(useSession);
const mockedSignOut = jest.mocked(signOut);
const mockedUseTheme = jest.mocked(useTheme);

describe("Header", () => {
  beforeEach(() => {
    mockedUseSession.mockReturnValue({
      data: null,
      status: "unauthenticated",
      update: jest.fn(),
    } as ReturnType<typeof useSession>);
    mockedSignOut.mockReset();
    mockedUseTheme.mockReturnValue({
      theme: "light",
      resolvedTheme: "light",
      setTheme: jest.fn(),
    } as unknown as ReturnType<typeof useTheme>);
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ themePreference: "light" }),
    });
  });

  it("zeigt den App-Namen JobTRIX an", () => {
    render(<Header locale="de" />);
    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByText("JobTRIX")).toBeInTheDocument();
  });

  it("enthält einen Link zur Startseite", () => {
    render(<Header locale="de" />);
    const link = screen.getByRole("link", { name: /jobtrix/i });
    expect(link).toHaveAttribute("href", "/de");
  });

  it("zeigt den Sprachumschalter an", () => {
    render(<Header locale="de" />);
    const buttons = screen.getAllByRole("button", { name: /english/i });
    expect(buttons.length).toBeGreaterThan(0);
  });

  it("zeigt keinen Logout-Button im abgemeldeten Zustand", () => {
    render(<Header locale="de" />);
    expect(screen.queryByRole("button", { name: "Abmelden" })).not.toBeInTheDocument();
  });

  it("zeigt im abgemeldeten Zustand keinen Navigationspunkt 'Bewerbungshistorie'", () => {
    render(<Header locale="de" />);
    expect(screen.queryByRole("link", { name: "Bewerbungshistorie" })).not.toBeInTheDocument();
  });

  it("zeigt im abgemeldeten Zustand keinen Navigationspunkt 'Bewerbung starten'", () => {
    render(<Header locale="de" />);
    expect(screen.queryByRole("link", { name: "Bewerbung starten" })).not.toBeInTheDocument();
  });

  it("zeigt im angemeldeten Zustand 'Bewerbung starten' Links", () => {
    mockedUseSession.mockReturnValue({
      data: { user: {}, expires: "" },
      status: "authenticated",
      update: jest.fn(),
    } as unknown as ReturnType<typeof useSession>);

    render(<Header locale="de" />);
    const links = screen.getAllByRole("link", { name: "Bewerbung starten" });
    expect(links[0]).toHaveAttribute("href", "/de/generate");
  });

  it("zeigt im angemeldeten Zustand 'Bewerbungshistorie' Links", () => {
    mockedUseSession.mockReturnValue({
      data: { user: {}, expires: "" },
      status: "authenticated",
      update: jest.fn(),
    } as unknown as ReturnType<typeof useSession>);

    render(<Header locale="de" />);
    const links = screen.getAllByRole("link", { name: "Bewerbungshistorie" });
    expect(links[0]).toHaveAttribute("href", "/de/application-history");
  });

  it("zeigt im angemeldeten Zustand Logout-Buttons", () => {
    mockedUseSession.mockReturnValue({
      data: { user: {}, expires: "" },
      status: "authenticated",
      update: jest.fn(),
    } as unknown as ReturnType<typeof useSession>);

    render(<Header locale="de" />);
    const buttons = screen.getAllByRole("button", { name: "Abmelden" });
    expect(buttons.length).toBeGreaterThan(0);
  });

  it("Logout-Button meldet ab und leitet zur Startseite", async () => {
    mockedUseSession.mockReturnValue({
      data: { user: {}, expires: "" },
      status: "authenticated",
      update: jest.fn(),
    } as unknown as ReturnType<typeof useSession>);

    render(<Header locale="de" />);
    const buttons = screen.getAllByRole("button", { name: "Abmelden" });
    await userEvent.click(buttons[0]);

    expect(mockedSignOut).toHaveBeenCalledWith({ callbackUrl: "/de" });
  });

  it("zeigt die aktive Sprache im Sprachumschalter an", () => {
    render(<Header locale="de" />);
    const buttons = screen.getAllByRole("button", { name: /english/i });
    expect(buttons[0]).toHaveTextContent("de");
  });

  it("zeigt den Dark-Mode-Umschalter an", () => {
    render(<Header locale="de" />);
    const buttons = screen.getAllByRole("button", { name: "Zu Dunkelmodus wechseln" });
    expect(buttons.length).toBeGreaterThan(0);
  });

  it("zeigt ein Hamburger-Menü-Button", () => {
    render(<Header locale="de" />);
    expect(screen.getByTestId("hamburger-button")).toBeInTheDocument();
  });

  it("zeigt das Mobile-Menü nach Klick auf Hamburger", async () => {
    render(<Header locale="de" />);
    const hamburger = screen.getByTestId("hamburger-button");

    await userEvent.click(hamburger);

    expect(hamburger).toHaveAttribute("aria-expanded", "true");
  });
});
