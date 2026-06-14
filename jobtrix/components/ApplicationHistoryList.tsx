"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ProfileData } from "@/lib/profile-storage";
import { downloadCoverLetterPdf, downloadCvPdf } from "@/lib/download-pdf";

export interface ApplicationHistoryEntry {
  id: string;
  createdAt: string;
  jobTitle: string | null;
  companyName: string | null;
  emailSubject: string;
  coverLetter: string;
  cv: string;
  profileSnapshot: ProfileData;
  template: "classic" | "modern" | "traditional" | "accent" | "creative";
  accentColor?: string | null;
  cvStyle?: "classic" | "american" | null;
}

const EXCERPT_LENGTH = 150;

function excerpt(text: string): string {
  const trimmed = text.trim();
  return trimmed.length > EXCERPT_LENGTH ? `${trimmed.slice(0, EXCERPT_LENGTH)}…` : trimmed;
}

export default function ApplicationHistoryList() {
  const t = useTranslations("applicationHistory");
  const { locale } = useParams<{ locale: string }>();
  const [entries, setEntries] = useState<ApplicationHistoryEntry[] | null>(null);

  useEffect(() => {
    fetch("/api/application-history")
      .then((res) => (res.ok ? (res.json() as Promise<ApplicationHistoryEntry[]>) : []))
      .then(setEntries)
      .catch(() => setEntries([]));
  }, []);

  if (entries === null) return null;

  async function handleDelete(id: string) {
    if (!window.confirm(t("deleteConfirm"))) return;

    const res = await fetch(`/api/application-history/${id}`, { method: "DELETE" });
    if (res.ok) {
      setEntries((prev) => (prev ? prev.filter((entry) => entry.id !== id) : prev));
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-3xl font-bold text-primary dark:text-accent">{t("title")}</h1>

      {entries.length === 0 ? (
        <div className="bg-white dark:bg-surface rounded-xl shadow p-6 text-center space-y-3">
          <p className="text-text/70">{t("emptyState")}</p>
          <Link href={`/${locale}/generate`} className="text-accent font-semibold hover:underline">
            {t("emptyStateLink")}
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {entries.map((entry) => (
            <div key={entry.id} className="bg-white dark:bg-surface rounded-xl shadow p-5 space-y-2">
              <div className="flex items-center justify-between gap-4">
                <h2 className="font-semibold text-primary dark:text-accent">
                  {entry.jobTitle ?? t("untitled")}
                  {entry.companyName ? ` – ${entry.companyName}` : ""}
                </h2>
                <span className="text-sm text-text/60 whitespace-nowrap">
                  {new Date(entry.createdAt).toLocaleString(locale, {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <p className="text-sm text-text/80">{excerpt(entry.coverLetter)}</p>
              <div className="flex gap-3 pt-2">
                <Link
                  href={`/${locale}/application-history/${entry.id}`}
                  className="rounded-full px-4 py-2 text-sm font-semibold bg-accent text-white hover:bg-accent/90 transition"
                >
                  {t("viewButton")}
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    const accentColor = entry.accentColor ?? undefined;
                    const cvStyle = entry.cvStyle ?? "classic";
                    downloadCoverLetterPdf(entry.coverLetter, entry.profileSnapshot, entry.template, accentColor);
                    downloadCvPdf(entry.cv, entry.profileSnapshot, entry.template, cvStyle, accentColor);
                  }}
                  className="rounded-full px-4 py-2 text-sm font-semibold border border-gray-200 dark:border-gray-700 text-text hover:border-accent hover:text-accent transition"
                >
                  {t("pdfButton")}
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(entry.id)}
                  className="rounded-full px-4 py-2 text-sm font-semibold border border-gray-200 dark:border-gray-700 text-red-600 dark:text-red-400 hover:border-red-600 dark:hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                >
                  {t("deleteButton")}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
