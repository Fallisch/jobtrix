import Link from "next/link";
import { getTranslations } from "next-intl/server";
import HeroSection from "@/components/HeroSection";
import TrustBadges from "@/components/TrustBadges";
import TrixMarquee from "@/components/TrixMarquee";
import HowItWorksSection from "@/components/HowItWorksSection";
import FeaturesSection from "@/components/FeaturesSection";
import ComparisonSection from "@/components/ComparisonSection";
import PricingTeaserSection from "@/components/PricingTeaserSection";
import FinalCtaSection from "@/components/FinalCtaSection";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function Home({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });

  return (
    <main>
      <HeroSection
        locale={locale}
        headline={t("headline")}
        subline={t("subline")}
        cta={t("cta")}
        freeBadge={t("freeBadge")}
        benefits={[t("benefit1"), t("benefit2"), t("benefit3")]}
      />
      <TrustBadges />
      <div className="text-center py-4">
        <Link
          href={`/${locale}/register`}
          data-testid="section-cta"
          className="inline-flex items-center min-h-[44px] text-accent font-semibold hover:underline transition"
        >
          {t("ctaTrustBadges")} →
        </Link>
      </div>
      <TrixMarquee />
      <HowItWorksSection
        title={t("howItWorks.title")}
        steps={[
          { title: t("howItWorks.step1Title"), desc: t("howItWorks.step1Desc") },
          { title: t("howItWorks.step2Title"), desc: t("howItWorks.step2Desc") },
          { title: t("howItWorks.step3Title"), desc: t("howItWorks.step3Desc") },
        ]}
      />
      <div className="text-center py-6">
        <Link
          href={`/${locale}/register`}
          data-testid="section-cta"
          className="inline-flex items-center min-h-[44px] bg-accent text-white px-8 py-3 rounded-full font-semibold hover:shadow-md hover:scale-[1.02] transition-all duration-200 shadow-sm"
        >
          {t("ctaHowItWorks")}
        </Link>
      </div>
      <FeaturesSection
        title={t("features.title")}
        features={[
          { title: t("features.pdf"), desc: t("features.pdfDesc") },
          { title: t("features.ai"), desc: t("features.aiDesc") },
          { title: t("features.email"), desc: t("features.emailDesc") },
          { title: t("features.jobSearch"), desc: t("features.jobSearchDesc") },
        ]}
      />
      <div className="text-center py-4">
        <Link
          href={`/${locale}/register`}
          data-testid="section-cta"
          className="inline-flex items-center min-h-[44px] text-accent font-semibold hover:underline transition"
        >
          {t("ctaFeatures")} →
        </Link>
      </div>
      <ComparisonSection />
      <div className="text-center py-6">
        <Link
          href={`/${locale}/register`}
          data-testid="section-cta"
          className="inline-flex items-center min-h-[44px] bg-accent text-white px-8 py-3 rounded-full font-semibold hover:shadow-md hover:scale-[1.02] transition-all duration-200 shadow-sm"
        >
          {t("ctaComparison")}
        </Link>
      </div>
      <PricingTeaserSection
        locale={locale}
        title={t("pricingTeaser.title")}
        desc={t("pricingTeaser.desc")}
        link={t("pricingTeaser.link")}
      />
      <FinalCtaSection
        locale={locale}
        title={t("finalCta.title")}
        desc={t("finalCta.desc")}
        cta={t("finalCta.cta")}
      />
    </main>
  );
}
