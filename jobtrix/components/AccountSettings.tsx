"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { signOut } from "next-auth/react";

export default function AccountSettings() {
  const t = useTranslations("account");
  const { locale } = useParams<{ locale: string }>();
  const [error, setError] = useState<string | null>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [exportPassword, setExportPassword] = useState("");
  const [exportError, setExportError] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function handleExport() {
    try {
      const res = await fetch("/api/account/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: exportPassword }),
      });
      if (!res.ok) {
        setExportError(res.status === 401 ? t("deleteWrongPassword") : t("exportError"));
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "meine-daten.json";
      a.click();
      URL.revokeObjectURL(url);
      setExportError(null);
      setExportOpen(false);
      setExportPassword("");
      setError(null);
    } catch {
      setExportError(t("exportError"));
    }
  }

  async function handleDeleteAccount() {
    try {
      const res = await fetch("/api/account/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: deletePassword }),
      });
      if (!res.ok) {
        setDeleteError(t("deleteWrongPassword"));
        return;
      }
      await signOut({ callbackUrl: `/${locale}` });
    } catch {
      setDeleteError(t("deleteGenericError"));
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 pb-8 space-y-4">
      <h2 className="text-lg font-semibold text-primary dark:text-accent">{t("title")}</h2>
      {error && <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>}
      <button
        type="button"
        onClick={() => setExportOpen((open) => !open)}
        className="rounded-full py-2 px-4 text-sm font-semibold bg-accent text-white hover:brightness-110"
      >
        {t("exportButton")}
      </button>

      {exportOpen && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-surface p-4 space-y-3">
          <p className="text-sm text-text/70">{t("exportPasswordHint")}</p>
          {exportError && <p className="text-red-600 dark:text-red-400 text-sm">{exportError}</p>}
          <div>
            <label htmlFor="export-password" className="block text-sm font-medium mb-1">
              {t("deletePasswordLabel")}
            </label>
            <input
              id="export-password"
              type="password"
              value={exportPassword}
              onChange={(e) => setExportPassword(e.target.value)}
              className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface px-4 py-2.5 text-base min-h-[44px] text-text focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          <button
            type="button"
            onClick={handleExport}
            disabled={!exportPassword}
            className="rounded-full py-2 px-4 text-sm font-semibold bg-accent text-white hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {t("exportConfirmButton")}
          </button>
        </div>
      )}

      <div>
        <button
          type="button"
          onClick={() => setDeleteOpen((open) => !open)}
          className="rounded-full py-2 px-4 text-sm font-semibold border border-gray-200 dark:border-gray-700 text-red-600 dark:text-red-400 hover:border-red-600 dark:hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
        >
          {t("deleteButton")}
        </button>
      </div>

      {deleteOpen && (
        <div className="rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 p-4 space-y-3">
          <p className="text-sm text-red-700 dark:text-red-300">{t("deleteWarning")}</p>
          {deleteError && <p className="text-red-600 dark:text-red-400 text-sm">{deleteError}</p>}
          <div>
            <label htmlFor="delete-password" className="block text-sm font-medium mb-1">
              {t("deletePasswordLabel")}
            </label>
            <input
              id="delete-password"
              type="password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface px-4 py-2.5 text-base min-h-[44px] text-text focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          <button
            type="button"
            onClick={handleDeleteAccount}
            disabled={!deletePassword}
            className="rounded-full py-2 px-4 text-sm font-semibold bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {t("deleteConfirmButton")}
          </button>
        </div>
      )}
    </div>
  );
}
