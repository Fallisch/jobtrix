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
    expect(screen.getByRole("button", { name: /english/i })).toBeInTheDocument();
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

  it("zeigt im angemeldeten Zustand einen Navigationspunkt 'Bewerbung starten', der zur Generierung führt", () => {
    mockedUseSession.mockReturnValue({
      data: { user: {}, expires: "" },
      status: "authenticated",
      update: jest.fn(),
    } as unknown as ReturnType<typeof useSession>);

    render(<Header locale="de" />);
    const link = screen.getByRole("link", { name: "Bewerbung starten" });
    expect(link).toHaveAttribute("href", "/de/generate");
  });

  it("zeigt im angemeldeten Zustand einen Navigationspunkt 'Bewerbungshistorie'", () => {
    mockedUseSession.mockReturnValue({
      data: { user: {}, expires: "" },
      status: "authenticated",
      update: jest.fn(),
    } as unknown as ReturnType<typeof useSession>);

    render(<Header locale="de" />);
    const link = screen.getByRole("link", { name: "Bewerbungshistorie" });
    expect(link).toHaveAttribute("href", "/de/application-history");
  });

  it("zeigt im angemeldeten Zustand einen Logout-Button", () => {
    mockedUseSession.mockReturnValue({
      data: { user: {}, expires: "" },
      status: "authenticated",
      update: jest.fn(),
    } as unknown as ReturnType<typeof useSession>);

    render(<Header locale="de" />);
    expect(screen.getByRole("button", { name: "Abmelden" })).toBeInTheDocument();
  });

  it("Logout-Button meldet ab und leitet zur Startseite", async () => {
    mockedUseSession.mockReturnValue({
      data: { user: {}, expires: "" },
      status: "authenticated",
      update: jest.fn(),
    } as unknown as ReturnType<typeof useSession>);

    render(<Header locale="de" />);
    await userEvent.click(screen.getByRole("button", { name: "Abmelden" }));

    expect(mockedSignOut).toHaveBeenCalledWith({ callbackUrl: "/de" });
  });

  it("zeigt den Dark-Mode-Umschalter an", () => {
    render(<Header locale="de" />);
    expect(screen.getByRole("button", { name: "Zu Dunkelmodus wechseln" })).toBeInTheDocument();
  });
});
