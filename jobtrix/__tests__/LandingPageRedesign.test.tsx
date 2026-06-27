import { render, screen } from "@testing-library/react";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import FinalCtaSection from "@/components/FinalCtaSection";
import PricingTeaserSection from "@/components/PricingTeaserSection";
import HowItWorksSection from "@/components/HowItWorksSection";

jest.mock("framer-motion", () => {
  const React = require("react");
  return {
    motion: new Proxy(
      {},
      {
        get: (_: unknown, tag: string) =>
          React.forwardRef((props: Record<string, unknown>, ref: unknown) => {
            const {
              initial,
              animate,
              whileInView,
              whileHover,
              viewport,
              transition: _transition,
              variants,
              custom,
              ...rest
            } = props;
            return React.createElement(tag, { ...rest, ref });
          }),
      }
    ),
  };
});

describe("Landingpage Redesign", () => {
  describe("HeroSection", () => {
    test("hat große Typografie (text-5xl oder text-6xl)", () => {
      const { container } = render(
        <HeroSection locale="de" headline="Test" subline="Sub" cta="CTA" freeBadge="Free" benefits={[]} />
      );
      const h1 = container.querySelector("h1");
      expect(h1?.className).toMatch(/text-5xl|text-6xl/);
    });

    test("CTA-Button hat min-h-[44px] und rounded-full", () => {
      const { container } = render(
        <HeroSection locale="de" headline="Test" subline="Sub" cta="CTA" freeBadge="Free" benefits={[]} />
      );
      const link = container.querySelector("a");
      expect(link?.className).toContain("rounded-full");
      expect(link?.className).toContain("min-h-[44px]");
    });

    test("rendert Vorteils-Bullets wenn vorhanden", () => {
      const benefits = ["Benefit A", "Benefit B", "Benefit C"];
      const { container } = render(
        <HeroSection locale="de" headline="Test" subline="Sub" cta="CTA" freeBadge="Free" benefits={benefits} />
      );
      const items = container.querySelectorAll("[data-testid='hero-benefit']");
      expect(items.length).toBe(3);
      expect(items[0].textContent).toContain("Benefit A");
      expect(items[1].textContent).toContain("Benefit B");
      expect(items[2].textContent).toContain("Benefit C");
    });
  });

  describe("FeaturesSection", () => {
    const features = [
      { title: "F1", desc: "D1" },
      { title: "F2", desc: "D2" },
    ];

    test("Feature-Karten haben hover:shadow-md", () => {
      const { container } = render(
        <FeaturesSection title="Features" features={features} />
      );
      const cards = container.querySelectorAll("[data-testid='feature-tile']");
      expect(cards.length).toBe(2);
      cards.forEach((card) => {
        expect(card.className).toContain("hover:shadow-md");
      });
    });

    test("Feature-Karten haben border", () => {
      const { container } = render(
        <FeaturesSection title="Features" features={features} />
      );
      const cards = container.querySelectorAll("[data-testid='feature-tile']");
      cards.forEach((card) => {
        expect(card.className).toMatch(/border/);
      });
    });

    test("jedes Feature-Tile hat ein SVG-Icon", () => {
      const fourFeatures = [
        { title: "PDF", desc: "D1" },
        { title: "AI", desc: "D2" },
        { title: "Email", desc: "D3" },
        { title: "Suche", desc: "D4" },
      ];
      const { container } = render(
        <FeaturesSection title="Features" features={fourFeatures} />
      );
      const tiles = container.querySelectorAll("[data-testid='feature-tile']");
      expect(tiles.length).toBe(4);
      tiles.forEach((tile) => {
        const svg = tile.querySelector("svg");
        expect(svg).not.toBeNull();
        expect(svg?.getAttribute("width")).toBe("24");
        expect(svg?.getAttribute("height")).toBe("24");
      });
    });

    test("Icons haben Accent-Farbe", () => {
      const fourFeatures = [
        { title: "PDF", desc: "D1" },
        { title: "AI", desc: "D2" },
        { title: "Email", desc: "D3" },
        { title: "Suche", desc: "D4" },
      ];
      const { container } = render(
        <FeaturesSection title="Features" features={fourFeatures} />
      );
      const tiles = container.querySelectorAll("[data-testid='feature-tile']");
      tiles.forEach((tile) => {
        const iconWrapper = tile.querySelector(".text-accent");
        expect(iconWrapper).not.toBeNull();
      });
    });

    test("keine Emojis in Feature-Tiles", () => {
      const fourFeatures = [
        { title: "PDF", desc: "D1" },
        { title: "AI", desc: "D2" },
        { title: "Email", desc: "D3" },
        { title: "Suche", desc: "D4" },
      ];
      const { container } = render(
        <FeaturesSection title="Features" features={fourFeatures} />
      );
      const emojiPattern = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
      expect(container.textContent).not.toMatch(emojiPattern);
    });
  });

  describe("FinalCtaSection", () => {
    test("hat visuellen Kontrast (bg-primary oder gradient)", () => {
      const { container } = render(
        <FinalCtaSection locale="de" title="T" desc="D" cta="CTA" />
      );
      const section = container.querySelector("[data-testid='final-cta']");
      expect(section?.className).toMatch(/bg-primary|bg-gradient/);
    });

    test("CTA-Button hat min-h-[44px]", () => {
      const { container } = render(
        <FinalCtaSection locale="de" title="T" desc="D" cta="CTA" />
      );
      const link = container.querySelector("a");
      expect(link?.className).toContain("min-h-[44px]");
    });
  });

  describe("PricingTeaserSection", () => {
    test("Button hat min-h-[44px] und rounded-full", () => {
      const { container } = render(
        <PricingTeaserSection locale="de" title="T" desc="D" link="L" />
      );
      const link = container.querySelector("a");
      expect(link?.className).toContain("rounded-full");
      expect(link?.className).toContain("min-h-[44px]");
    });
  });

  describe("HowItWorksSection", () => {
    const steps: [{ title: string; desc: string }, { title: string; desc: string }, { title: string; desc: string }] = [
      { title: "S1", desc: "D1" },
      { title: "S2", desc: "D2" },
      { title: "S3", desc: "D3" },
    ];

    test("hat Sektions-Padding py-20", () => {
      const { container } = render(
        <HowItWorksSection title="How" steps={steps} />
      );
      const section = container.querySelector("[data-testid='how-it-works']");
      expect(section?.className).toContain("py-20");
    });

    test("hat max-w-5xl", () => {
      const { container } = render(
        <HowItWorksSection title="How" steps={steps} />
      );
      const wrapper = container.querySelector(".max-w-5xl");
      expect(wrapper).not.toBeNull();
    });
  });
});
