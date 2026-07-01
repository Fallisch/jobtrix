import { render, screen } from "@testing-library/react";
import LocaleLayout from "@/app/[locale]/layout";

const getMessagesMock = jest.fn().mockResolvedValue({});

jest.mock("next-intl/server", () => ({
  getMessages: (...args: unknown[]) => getMessagesMock(...args),
}));

jest.mock("@/i18n/routing", () => ({
  routing: { locales: ["de", "en"], defaultLocale: "de" },
}));

const providerProps: { locale?: string }[] = [];

jest.mock("next-intl", () => {
  const de = require("@/messages/de.json");

  return {
    NextIntlClientProvider: ({
      children,
      locale,
    }: {
      children: React.ReactNode;
      locale?: string;
    }) => {
      providerProps.push({ locale });
      return children;
    },
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

jest.mock("@/components/Header", () => ({
  __esModule: true,
  default: () => <div data-testid="header" />,
}));

jest.mock("@/components/InstallBanner", () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock("@/components/WelcomeGate", () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock("@/components/AuthSessionProvider", () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => children,
}));

describe("LocaleLayout", () => {
  beforeEach(() => {
    providerProps.length = 0;
  });

  it("übergibt das aktive Locale an den NextIntlClientProvider (verhindert 404 beim erneuten Sprachwechsel, #233)", async () => {
    const jsx = await LocaleLayout({
      children: <div>Seiteninhalt</div>,
      params: Promise.resolve({ locale: "en" }),
    });
    render(jsx);

    expect(providerProps.at(-1)?.locale).toBe("en");
  });

  it("lädt die Messages für den aktiven Locale, nicht die Default-Sprache (#237)", async () => {
    getMessagesMock.mockClear();
    const jsx = await LocaleLayout({
      children: <div>Seiteninhalt</div>,
      params: Promise.resolve({ locale: "en" }),
    });
    render(jsx);

    // Ohne { locale: "en" } liefert getMessages die Default-Messages (de),
    // wodurch alle Client-Komponenten auf /en deutsch blieben.
    expect(getMessagesMock).toHaveBeenCalledWith({ locale: "en" });
  });

  it("rendert den Footer mit den Rechtlinks unterhalb von <main>", async () => {
    const jsx = await LocaleLayout({
      children: <div>Seiteninhalt</div>,
      params: Promise.resolve({ locale: "de" }),
    });
    render(jsx);

    expect(screen.getByText("Seiteninhalt")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Impressum" })).toHaveAttribute("href", "/de/impressum");
    expect(screen.getByRole("link", { name: "Datenschutz" })).toHaveAttribute("href", "/de/datenschutz");
  });
});
