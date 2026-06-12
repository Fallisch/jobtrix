"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ApplicationHistoryEntry } from "@/components/ApplicationHistoryList";
import { downloadCoverLetterPdf, downloadCvPdf } from "@/lib/download-pdf";

export default function ApplicationHistoryDetail({ id }: { id: string }) {
  const t = useTranslations("applicationHistory");
  const { locale } = useParams<{ locale: string }>();
  const [entry, setEntry] = useState<ApplicationHistoryEntry | null>(null);
  const [notFound, setNotFound] = useState(false);

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
        <h1 className="text-3xl font-bold text-primary">
          {entry.jobTitle ?? t("untitled")}
          {entry.companyName ? ` – ${entry.companyName}` : ""}
        </h1>
        <span className="text-sm text-text/60 whitespace-nowrap">
          {new Date(entry.createdAt).toLocaleDateString(locale)}
        </span>
      </div>

      <button
        type="button"
        onClick={() => {
          downloadCoverLetterPdf(entry.coverLetter, entry.profileSnapshot, entry.template);
          downloadCvPdf(entry.cv, entry.profileSnapshot, entry.template);
        }}
        className="rounded-full px-4 py-2 text-sm font-semibold border border-gray-200 text-text hover:border-accent hover:text-accent transition"
      >
        {t("pdfButton")}
      </button>

      <section className="bg-white rounded-xl shadow p-5 space-y-2">
        <h2 className="font-semibold text-primary">{t("coverLetterTitle")}</h2>
        <p className="text-sm text-text/80 whitespace-pre-wrap">{entry.coverLetter}</p>
      </section>

      <section className="bg-white rounded-xl shadow p-5 space-y-2">
        <h2 className="font-semibold text-primary">{t("cvTitle")}</h2>
        <p className="text-sm text-text/80 whitespace-pre-wrap">{entry.cv}</p>
      </section>

      <section className="bg-white rounded-xl shadow p-5 space-y-2">
        <h2 className="font-semibold text-primary">{t("emailDraftTitle")}</h2>
        <div>
          <span className="text-sm font-medium text-text/60">{t("emailSubjectLabel")}</span>
          <p className="text-sm text-text/80">{entry.emailSubject}</p>
        </div>
        <div>
          <span className="text-sm font-medium text-text/60">{t("emailBodyLabel")}</span>
          <p className="text-sm text-text/80 whitespace-pre-wrap">{entry.coverLetter}</p>
        </div>
      </section>
    </div>
  );
}
