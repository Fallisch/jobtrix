import { render } from "@testing-library/react";

jest.mock("framer-motion", () => {
  const React = require("react");
  return {
    motion: new Proxy(
      {},
      {
        get: (_target: unknown, prop: string) =>
          React.forwardRef((props: Record<string, unknown>, ref: unknown) => {
            const { initial, animate, whileInView, viewport, variants, custom, transition, ...rest } = props;
            return React.createElement(prop, { ...rest, ref });
          }),
      },
    ),
  };
});

jest.mock("next-intl", () => {
  const de = require("@/messages/de.json");
  return {
    useTranslations:
      (namespace: string) =>
      (key: string) => {
        const ns = (de as Record<string, unknown>)[namespace] as
          | Record<string, unknown>
          | undefined;
        const value = ns?.[key];
        return typeof value === "string" ? value : key;
      },
  };
});

jest.mock("next-intl/server", () => ({
  getTranslations: async ({ namespace }: { locale: string; namespace: string }) => {
    const de = require("@/messages/de.json");
    const ns = (de as Record<string, unknown>)[namespace] as Record<string, unknown> | undefined;
    return (key: string) => {
      const value = ns?.[key];
      return typeof value === "string" ? value : key;
    };
  },
}));

jest.mock("next/navigation", () => ({
  useParams: () => ({ locale: "de" }),
}));

jest.mock("next-auth/react", () => ({
  useSession: () => ({ data: null, status: "unauthenticated" }),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}));

import Home from "@/app/[locale]/page";

async function renderPage() {
  const Component = await Home({ params: Promise.resolve({ locale: "de" }) });
  return render(Component);
}

describe("Landingpage CTA-Wiederholungen", () => {
  test("hat mindestens 3 zusätzliche CTA-Links auf /register", async () => {
    const { container } = await renderPage();
    const ctaLinks = container.querySelectorAll("a[data-testid='section-cta']");
    expect(ctaLinks.length).toBeGreaterThanOrEqual(3);
    ctaLinks.forEach((link) => {
      expect(link.getAttribute("href")).toContain("/register");
    });
  });

  test("CTAs wechseln zwischen Button und Text-Link Stil", async () => {
    const { container } = await renderPage();
    const ctaLinks = container.querySelectorAll("a[data-testid='section-cta']");
    const classes = Array.from(ctaLinks).map((l) => l.getAttribute("class") || "");
    const hasButton = classes.some((c) => c.includes("bg-accent"));
    const hasTextLink = classes.some((c) => c.includes("hover:underline"));
    expect(hasButton).toBe(true);
    expect(hasTextLink).toBe(true);
  });

  test("alle CTAs haben min-h-[44px] Touch-Target", async () => {
    const { container } = await renderPage();
    const ctaLinks = container.querySelectorAll("a[data-testid='section-cta']");
    ctaLinks.forEach((link) => {
      expect(link.getAttribute("class")).toContain("min-h-[44px]");
    });
  });
});
