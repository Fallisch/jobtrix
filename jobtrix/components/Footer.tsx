"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

export default function Footer({ locale }: { locale: string }) {
  const t = useTranslations("footer");

  return (
    <footer className="bg-primary text-white">
      <div className="max-w-5xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4 text-sm">
        <div className="flex flex-wrap items-center gap-4">
          <Link href={`/${locale}/impressum`} className="text-white/80 hover:text-white transition-colors">
            {t("impressumLink")}
          </Link>
          <Link href={`/${locale}/datenschutz`} className="text-white/80 hover:text-white transition-colors">
            {t("datenschutzLink")}
          </Link>
          <Link href={`/${locale}/agb`} className="text-white/80 hover:text-white transition-colors">
            {t("agbLink")}
          </Link>
          <Link href={`/${locale}/hilfe`} className="text-white/80 hover:text-white transition-colors">
            {t("hilfeLink")}
          </Link>
          <Link href={`/${locale}/pricing`} className="text-white/80 hover:text-white transition-colors">
            {t("pricingLink")}
          </Link>
        </div>
        <span className="text-white/60">&copy; 2026 Faltrix - Solutions</span>
      </div>
    </footer>
  );
}
