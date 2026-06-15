import { render, screen } from "@testing-library/react";
import LocaleLayout from "@/app/[locale]/layout";

jest.mock("next-intl/server", () => ({
  getMessages: jest.fn().mockResolvedValue({}),
}));

jest.mock("@/i18n/routing", () => ({
  routing: { locales: ["de", "en"], defaultLocale: "de" },
}));

jest.mock("next-intl", () => {
  const de = require("@/messages/de.json");

  return {
    NextIntlClientProvider: ({ children }: { children: React.ReactNode }) => children,
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

jest.mock("@/components/AuthSessionProvider", () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => children,
}));

describe("LocaleLayout", () => {
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
