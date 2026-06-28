import { render, screen } from "@testing-library/react";
import ComparisonSection from "@/components/ComparisonSection";

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

describe("ComparisonSection", () => {
  test("rendert Tabelle mit 3 Spalten-Headern (ChatGPT, Canva, JobTRIX)", () => {
    render(<ComparisonSection />);
    expect(screen.getByText("ChatGPT")).toBeInTheDocument();
    expect(screen.getByText("Canva")).toBeInTheDocument();
    expect(screen.getByText("JobTRIX")).toBeInTheDocument();
  });

  test("rendert alle 7 Feature-Zeilen", () => {
    const { container } = render(<ComparisonSection />);
    const rows = container.querySelectorAll("tbody tr");
    expect(rows.length).toBe(7);
  });

  test("hat visuell konsistentes Karten-Styling", () => {
    const { container } = render(<ComparisonSection />);
    const wrapper = container.querySelector("[class*='rounded-2xl']");
    expect(wrapper).not.toBeNull();
    expect(wrapper?.className).toMatch(/shadow-sm/);
  });

  test("Häkchen, Teilweise und Kreuze sind visuell unterscheidbar", () => {
    const { container } = render(<ComparisonSection />);
    const checks = container.querySelectorAll("[data-testid='check']");
    const partials = container.querySelectorAll("[data-testid='partial']");
    const crosses = container.querySelectorAll("[data-testid='cross']");
    expect(checks.length).toBeGreaterThan(0);
    expect(partials.length).toBeGreaterThan(0);
    expect(crosses.length).toBeGreaterThan(0);
  });

  test("hat data-testid für Landingpage-Einbindung", () => {
    const { container } = render(<ComparisonSection />);
    expect(container.querySelector("[data-testid='comparison']")).not.toBeNull();
  });
});
