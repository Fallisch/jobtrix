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
        <HeroSection locale="de" headline="Test" subline="Sub" cta="CTA" freeBadge="Free" />
      );
      const h1 = container.querySelector("h1");
      expect(h1?.className).toMatch(/text-5xl|text-6xl/);
    });

    test("CTA-Button hat min-h-[44px] und rounded-full", () => {
      const { container } = render(
        <HeroSection locale="de" headline="Test" subline="Sub" cta="CTA" freeBadge="Free" />
      );
      const link = container.querySelector("a");
      expect(link?.className).toContain("rounded-full");
      expect(link?.className).toContain("min-h-[44px]");
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
