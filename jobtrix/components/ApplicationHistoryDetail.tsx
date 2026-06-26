"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ApplicationHistoryEntry } from "@/components/ApplicationHistoryList";
import { downloadCoverLetterPdf, downloadCvPdf } from "@/lib/download-pdf";

type Tab = "coverLetter" | "cv" | "email";

export default function ApplicationHistoryDetail({ id }: { id: string }) {
  const t = useTranslations("applicationHistory");
  const { locale } = useParams<{ locale: string }>();
  const [entry, setEntry] = useState<ApplicationHistoryEntry | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("coverLetter");

  useEffect(() => {
    fetch(`/api/application-history/${id}`)
      .then((res) => {
        if (!res.ok) {
          setNotFound(true);
          return null;
        }
        return res.json() as Promise<ApplicationHistoryEntry>;
      })
      .then((data) => {
        if (data) setEntry(data);
      })
      .catch(() => setNotFound(true));
  }, [id]);

  if (notFound) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
        <p className="text-text/70">{t("notFound")}</p>
        <Link href={`/${locale}/application-history`} className="text-accent font-semibold hover:underline">
          {t("backLink")}
        </Link>
      </div>
    );
  }

  if (!entry) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <Link href={`/${locale}/application-history`} className="text-accent font-semibold hover:underline">
        {t("backLink")}
      </Link>

      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-primary dark:text-accent">
          {entry.jobTitle ?? t("untitled")}
          {entry.companyName ? ` – ${entry.companyName}` : ""}
        </h1>
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

      <div role="tablist" className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "coverLetter"}
          onClick={() => setActiveTab("coverLetter")}
          className={`px-4 py-2 text-sm font-semibold border-b-2 -mb-px transition ${
            activeTab === "coverLetter" ? "border-accent text-accent" : "border-transparent text-text/60 hover:text-accent"
          }`}
        >
          {t("coverLetterTitle")}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "cv"}
          onClick={() => setActiveTab("cv")}
          className={`px-4 py-2 text-sm font-semibold border-b-2 -mb-px transition ${
            activeTab === "cv" ? "border-accent text-accent" : "border-transparent text-text/60 hover:text-accent"
          }`}
        >
          {t("cvTitle")}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "email"}
          onClick={() => setActiveTab("email")}
          className={`px-4 py-2 text-sm font-semibold border-b-2 -mb-px transition ${
            activeTab === "email" ? "border-accent text-accent" : "border-transparent text-text/60 hover:text-accent"
          }`}
        >
          {t("emailDraftTitle")}
        </button>
      </div>

      {activeTab === "coverLetter" && (
        <section className="bg-white dark:bg-surface rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 space-y-2">
          <h2 className="font-semibold text-primary dark:text-accent">{t("coverLetterTitle")}</h2>
          <p className="text-sm text-text/80 whitespace-pre-wrap">{entry.coverLetter}</p>
        </section>
      )}

      {activeTab === "cv" && (
        <section className="bg-white dark:bg-surface rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 space-y-2">
          <h2 className="font-semibold text-primary dark:text-accent">{t("cvTitle")}</h2>
          <p className="text-sm text-text/80 whitespace-pre-wrap">{entry.cv}</p>
        </section>
      )}

      {activeTab === "email" && (
        <section className="bg-white dark:bg-surface rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 space-y-2">
          <h2 className="font-semibold text-primary dark:text-accent">{t("emailDraftTitle")}</h2>
          <div>
            <span className="text-sm font-medium text-text/60">{t("emailSubjectLabel")}</span>
            <p className="text-sm text-text/80">{entry.emailSubject}</p>
          </div>
          <div>
            <span className="text-sm font-medium text-text/60">{t("emailBodyLabel")}</span>
            <p className="text-sm text-text/80 whitespace-pre-wrap">
              {entry.emailBody ?? t("noEmailBody")}
            </p>
          </div>
        </section>
      )}
    </div>
  );
}
