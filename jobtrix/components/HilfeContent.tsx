"use client";

import { useTranslations } from "next-intl";

const items = ["application", "packages", "jobSearch", "layout", "account", "support"] as const;

export default function HilfeContent() {
  const t = useTranslations("help");

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold text-primary dark:text-accent">{t("title")}</h1>
      <div className="space-y-3">
        {items.map((item) => (
          <details
            key={item}
            className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface p-4"
          >
            <summary className="font-semibold text-primary dark:text-accent cursor-pointer">
              {t(`${item}Question`)}
            </summary>
            <p className="text-text/70 whitespace-pre-line mt-2">{t(`${item}Answer`)}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
