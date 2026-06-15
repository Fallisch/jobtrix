"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

export default function AccountSettings() {
  const t = useTranslations("account");
  const [error, setError] = useState<string | null>(null);

  async function handleExport() {
    try {
      const res = await fetch("/api/account/export");
      if (!res.ok) {
        setError(t("exportError"));
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "meine-daten.json";
      a.click();
      URL.revokeObjectURL(url);
      setError(null);
    } catch {
      setError(t("exportError"));
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 pb-8 space-y-4">
      <h2 className="text-lg font-semibold text-primary dark:text-accent">{t("title")}</h2>
      {error && <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>}
      <button
        type="button"
        onClick={handleExport}
        className="rounded-full py-2 px-4 text-sm font-semibold bg-accent text-white hover:brightness-110"
      >
        {t("exportButton")}
      </button>
    </div>
  );
}
