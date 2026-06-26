import { render, screen } from "@testing-library/react";
import TrustBadges from "@/components/TrustBadges";

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
        if (Array.isArray(value)) return value;
        return typeof value === "string" ? value : key;
      },
  };
});

describe("TrustBadges", () => {
  const expectedBadges = [
    "Hosting in Deutschland",
    "DSGVO-konform",
    "Verschlüsselte Übertragung",
    "Sichere Zahlung",
    "Deine Daten gehören dir",
  ];

  test("rendert alle 5 Badges", () => {
    render(<TrustBadges />);
    for (const badge of expectedBadges) {
      expect(screen.getByText(badge)).toBeInTheDocument();
    }
  });

  test("jedes Badge hat ein SVG-Icon", () => {
    const { container } = render(<TrustBadges />);
    const svgs = container.querySelectorAll("svg");
    expect(svgs.length).toBe(5);
    svgs.forEach((svg) => {
      expect(svg.getAttribute("width")).toBe("24");
      expect(svg.getAttribute("height")).toBe("24");
    });
  });

  test("verwendet flex-wrap für Responsivität", () => {
    const { container } = render(<TrustBadges />);
    const wrapper = container.querySelector("[class*='flex-wrap']");
    expect(wrapper).not.toBeNull();
  });

  test("hat text-sm Styling", () => {
    const { container } = render(<TrustBadges />);
    const el = container.querySelector("[class*='text-sm']");
    expect(el).not.toBeNull();
  });
});
