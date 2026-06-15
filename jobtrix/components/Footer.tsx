"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

export default function Footer({ locale }: { locale: string }) {
  const t = useTranslations("footer");

  return (
    <footer className="bg-primary text-white">
      <div className="max-w-5xl mx-auto px-4 py-3 flex flex-wrap items-center gap-4 text-sm">
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
      </div>
    </footer>
  );
}
