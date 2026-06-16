import { getTranslations } from "next-intl/server";
import HeroSection from "@/components/HeroSection";

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
      />
    </main>
  );
}
