import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import PricingCards from "@/components/PricingCards";

jest.mock("next-intl", () => {
  const de = require("@/messages/de.json");

  return {
    useLocale: () => "de",
    useTranslations:
      (namespace: string) =>
      (key: string, params?: Record<string, string | number>) => {
        const value = key
          .split(".")
          .reduce<unknown>(
            (acc, part) => (acc as Record<string, unknown> | undefined)?.[part],
            de[namespace]
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

global.fetch = jest.fn();

const config = {
  limited: { priceEur: 9.99, durationDays: 30 },
  lifetime: { priceEur: 29.99 },
};

beforeEach(() => {
  (global.fetch as jest.Mock).mockReset();
});

describe("PricingCards", () => {
  it("zeigt beide Pakete mit Preis und Laufzeit aus der Konfiguration", () => {
    render(<PricingCards config={config} />);

    expect(screen.getByText(/^9,99/)).toBeInTheDocument();
    expect(screen.getByText(/30 Tage/)).toBeInTheDocument();
    expect(screen.getByText(/^29,99/)).toBeInTheDocument();
  });

  it("hebt das Lifetime-Paket als empfohlen hervor", () => {
    render(<PricingCards config={config} />);

    expect(screen.getByText("Empfohlen")).toBeInTheDocument();
  });

  it("leitet bei Klick auf ein Paket zur von /api/checkout gelieferten Stripe-Checkout-URL weiter", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ url: "https://checkout.stripe.com/test-session" }),
    });
    const navigate = jest.fn();

    render(<PricingCards config={config} navigate={navigate} />);
    fireEvent.click(screen.getAllByRole("button", { name: "Jetzt kaufen" })[0]);

    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith("https://checkout.stripe.com/test-session");
    });

    const body = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
    expect(body.package).toBe("limited");
  });

  it("sendet 'lifetime' als Paket wenn die Lifetime-Karte gekauft wird", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ url: "https://checkout.stripe.com/test-session-lifetime" }),
    });
    const navigate = jest.fn();

    render(<PricingCards config={config} navigate={navigate} />);
    fireEvent.click(screen.getAllByRole("button", { name: "Jetzt kaufen" })[1]);

    await waitFor(() => {
      const body = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
      expect(body.package).toBe("lifetime");
    });
  });

  it("zeigt eine Fehlermeldung wenn /api/checkout fehlschlägt", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: false, json: () => Promise.resolve({}) });

    render(<PricingCards config={config} />);
    fireEvent.click(screen.getAllByRole("button", { name: "Jetzt kaufen" })[0]);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
  });
});
