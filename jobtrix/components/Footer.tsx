"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

export default function Footer({ locale }: { locale: string }) {
  const t = useTranslations("footer");

  return (
    <footer className="bg-primary text-white">
      <div className="max-w-5xl mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
        <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4">
          <Link href={`/${locale}/impressum`} className="text-white/80 hover:text-white transition-colors min-h-[44px] flex items-center">
            {t("impressumLink")}
          </Link>
          <Link href={`/${locale}/datenschutz`} className="text-white/80 hover:text-white transition-colors min-h-[44px] flex items-center">
            {t("datenschutzLink")}
          </Link>
          <Link href={`/${locale}/agb`} className="text-white/80 hover:text-white transition-colors min-h-[44px] flex items-center">
            {t("agbLink")}
          </Link>
          <Link href={`/${locale}/hilfe`} className="text-white/80 hover:text-white transition-colors min-h-[44px] flex items-center">
            {t("hilfeLink")}
          </Link>
          <Link href={`/${locale}/pricing`} className="text-white/80 hover:text-white transition-colors min-h-[44px] flex items-center">
            {t("pricingLink")}
          </Link>
        </div>
        <span className="text-white/60">&copy; 2026 Faltrix - Solutions</span>
      </div>
    </footer>
  );
}
