"use client";

import { useTranslations } from "next-intl";

const sections = ["provider", "representative", "contact", "vat", "dispute"] as const;

export default function ImpressumContent() {
  const t = useTranslations("impressum");

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold text-primary dark:text-accent">{t("title")}</h1>
      {sections.map((section) => (
        <div key={section}>
          <h2 className="text-lg font-semibold text-primary dark:text-accent mb-2">
            {t(`${section}Heading`)}
          </h2>
          <p className="text-text/70 whitespace-pre-line">{t(`${section}Body`)}</p>
        </div>
      ))}
    </div>
  );
}
