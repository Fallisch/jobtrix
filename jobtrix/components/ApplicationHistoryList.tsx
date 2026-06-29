"use client";

import { useCallback, useEffect, useState } from "react";
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
  emailBody?: string | null;
  profileSnapshot: ProfileData;
  template: "classic" | "modern" | "traditional" | "accent" | "creative";
  accentColor?: string | null;
  cvStyle?: "classic" | "american" | null;
}

const EXCERPT_LENGTH = 150;
const PAGE_SIZE = 100;

function excerpt(text: string): string {
  const trimmed = text.trim();
  return trimmed.length > EXCERPT_LENGTH ? `${trimmed.slice(0, EXCERPT_LENGTH)}…` : trimmed;
}

function stripMarkdown(text: string): string {
  return text.replace(/#{1,6}\s*/g, "").replace(/\*{1,3}/g, "").replace(/_{1,3}/g, "").replace(/`/g, "").replace(/&#\d+;/g, " ").replace(/\s+/g, " ").trim();
}

function deriveTitle(entry: ApplicationHistoryEntry, fallback: string): string {
  if (entry.jobTitle) return stripMarkdown(entry.jobTitle);
  const subj = entry.emailSubject;
  if (subj) {
    const m = subj.match(/Bewerbung\s+als\s+(.+?)(?:\s+[–—-]\s+|$)/i);
    if (m?.[1] && m[1].length >= 3) return stripMarkdown(m[1]);
    if (subj.length >= 5 && subj.length <= 200) return stripMarkdown(subj);
  }
  return fallback;
}

export default function ApplicationHistoryList() {
  const t = useTranslations("applicationHistory");
  const { locale } = useParams<{ locale: string }>();
  const [entries, setEntries] = useState<ApplicationHistoryEntry[] | null>(null);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/application-history?offset=0&limit=${PAGE_SIZE}`)
      .then((res) => (res.ok ? res.json() : { entries: [], total: 0 }))
      .then((data: { entries: ApplicationHistoryEntry[]; total: number }) => {
        setEntries(data.entries);
        setTotal(data.total);
      })
      .catch(() => {
        setEntries([]);
        setTotal(0);
      });
  }, []);

  const loadMore = useCallback(() => {
    if (!entries || loading) return;
    setLoading(true);
    fetch(`/api/application-history?offset=${entries.length}&limit=${PAGE_SIZE}`)
      .then((res) => (res.ok ? res.json() : { entries: [], total }))
      .then((data: { entries: ApplicationHistoryEntry[]; total: number }) => {
        setEntries((prev) => [...(prev ?? []), ...data.entries]);
        setTotal(data.total);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [entries, loading, total]);

  if (entries === null) return null;

  async function handleDelete(id: string) {
    if (!window.confirm(t("deleteConfirm"))) return;

    const res = await fetch(`/api/application-history/${id}`, { method: "DELETE" });
    if (res.ok) {
      setEntries((prev) => (prev ? prev.filter((entry) => entry.id !== id) : prev));
      setTotal((prev) => prev - 1);
    }
  }

  const hasMore = entries.length < total;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-3xl font-bold text-primary dark:text-accent">{t("title")}</h1>

      {entries.length > 0 && (
        <div>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="w-full rounded-full px-5 py-3 text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface text-text dark:text-white placeholder:text-text/50 dark:placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition"
          />
        </div>
      )}

      {entries.length === 0 ? (
        <div className="bg-white dark:bg-surface rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 text-center space-y-3">
          <p className="text-text/70">{t("emptyState")}</p>
          <Link href={`/${locale}/generate`} className="text-accent font-semibold hover:underline">
            {t("emptyStateLink")}
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {(() => {
            const q = searchQuery.toLowerCase().trim();
            const filtered = q
              ? entries.filter((e) => {
                  const title = deriveTitle(e, "").toLowerCase();
                  const company = (e.companyName ?? "").toLowerCase();
                  const date = new Date(e.createdAt).toLocaleString(locale, {
                    day: "2-digit", month: "2-digit", year: "numeric",
                  });
                  return title.includes(q) || company.includes(q) || date.includes(q);
                })
              : entries;

            if (filtered.length === 0) {
              return (
                <div className="bg-white dark:bg-surface rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 text-center">
                  <p className="text-text/70">{t("noResults")}</p>
                </div>
              );
            }

            return filtered.sort((a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            ).map((entry) => (
            <div key={entry.id} className="bg-white dark:bg-surface rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all duration-200 p-5 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
                <h2 className="font-semibold text-primary dark:text-accent">
                  {deriveTitle(entry, t("untitled"))}
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
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 pt-2">
                <Link
                  href={`/${locale}/application-history/${entry.id}`}
                  className="inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold bg-accent text-white hover:bg-accent/90 transition"
                >
                  {t("viewButton")}
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    const accentColor = entry.accentColor ?? undefined;
                    const cvStyle = entry.cvStyle ?? "classic";
                    downloadCoverLetterPdf(entry.coverLetter, entry.profileSnapshot, entry.template, accentColor, locale);
                    downloadCvPdf(entry.cv, entry.profileSnapshot, entry.template, cvStyle, accentColor, locale);
                  }}
                  className="inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold border border-gray-200 dark:border-gray-700 text-text hover:border-accent hover:text-accent transition"
                >
                  {t("pdfButton")}
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(entry.id)}
                  className="col-span-2 sm:col-span-1 inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold border border-gray-200 dark:border-gray-700 text-red-600 dark:text-red-400 hover:border-red-600 dark:hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                >
                  {t("deleteButton")}
                </button>
              </div>
            </div>
          ));
          })()}

          {hasMore && (
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={loadMore}
                disabled={loading}
                className="rounded-full px-6 py-2 text-sm font-semibold border border-gray-200 dark:border-gray-700 text-text hover:border-accent hover:text-accent transition disabled:opacity-50"
              >
                {t("loadMore")}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
