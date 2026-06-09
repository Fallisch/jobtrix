"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { loadProfile } from "@/lib/profile-storage";
import EmailDraft from "@/components/EmailDraft";
import { downloadCoverLetterPdf, downloadCvPdf } from "@/lib/download-pdf";

interface GenerateResult {
  coverLetter: string;
  cv: string;
  emailSubject: string;
}

export default function GenerateForm() {
  const t = useTranslations("generate");
  const [jobPosting, setJobPosting] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [hasProfile, setHasProfile] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editedCoverLetter, setEditedCoverLetter] = useState("");
  const [editedCv, setEditedCv] = useState("");

  useEffect(() => {
    setHasProfile(loadProfile() !== null);
  }, []);

  const canGenerate = jobPosting.trim().length > 0 && hasProfile;

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    setResult(null);

    const profile = loadProfile();
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobPosting, companyName, contactPerson, profile }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? t("errorGeneric"));
      } else {
        setResult(data);
        setEditedCoverLetter(data.coverLetter);
        setEditedCv(data.cv);
      }
    } catch {
      setError(t("errorGeneric"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-3xl font-bold text-primary">{t("title")}</h1>

      <div className="space-y-4">
        <div>
          <label htmlFor="jobPosting" className="block text-sm font-medium text-text mb-1">
            {t("jobPostingLabel")}
          </label>
          <textarea
            id="jobPosting"
            value={jobPosting}
            onChange={(e) => setJobPosting(e.target.value)}
            rows={8}
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-text placeholder:text-text/40 focus:outline-none focus:ring-2 focus:ring-accent resize-y"
            placeholder={t("jobPostingPlaceholder")}
            aria-label={t("jobPostingLabel")}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="companyName" className="block text-sm font-medium text-text mb-1">
              {t("companyNameLabel")}
            </label>
            <input
              id="companyName"
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-text placeholder:text-text/40 focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder={t("optional")}
              aria-label={t("companyNameLabel")}
            />
          </div>
          <div>
            <label htmlFor="contactPerson" className="block text-sm font-medium text-text mb-1">
              {t("contactPersonLabel")}
            </label>
            <input
              id="contactPerson"
              type="text"
              value={contactPerson}
              onChange={(e) => setContactPerson(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-text placeholder:text-text/40 focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder={t("optional")}
              aria-label={t("contactPersonLabel")}
            />
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={!canGenerate || loading}
          className="w-full sm:w-auto bg-accent text-white px-8 py-3 rounded-full font-semibold text-base hover:brightness-110 transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {t("generateButton")}
        </button>
      </div>

      {loading && (
        <div data-testid="loading-animation" className="rounded-2xl bg-gray-100 p-8 flex flex-col items-center gap-4">
          <div
            data-testid="loading-spinner"
            className="animate-spin h-14 w-14 rounded-full border-4 border-accent/20 border-t-accent flex items-center justify-center"
          >
            <span className="text-xs font-bold text-primary">J</span>
          </div>
          <p className="text-sm text-text/60">{t("loading")}</p>
        </div>
      )}

      {error && (
        <div role="alert" className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-red-700 text-sm">
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-primary mb-2">{t("coverLetterTitle")}</h2>
            <textarea
              value={editedCoverLetter}
              onChange={(e) => setEditedCoverLetter(e.target.value)}
              rows={14}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent resize-y"
              aria-label={t("coverLetterTitle")}
            />
            <div className="mt-3">
              <button
                onClick={() => {
                  const profile = loadProfile();
                  if (profile) downloadCoverLetterPdf(editedCoverLetter, profile);
                }}
                className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-full text-sm font-medium hover:brightness-110 transition"
                aria-label={t("coverLetterPdfButton")}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.955 3.129V2.75Z" />
                  <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
                </svg>
                {t("coverLetterPdfButton")}
              </button>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-primary mb-2">{t("cvTitle")}</h2>
            <textarea
              value={editedCv}
              onChange={(e) => setEditedCv(e.target.value)}
              rows={14}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent resize-y"
              aria-label={t("cvTitle")}
            />
            <div className="mt-3">
              <button
                onClick={() => {
                  const profile = loadProfile();
                  if (profile) downloadCvPdf(editedCv, profile);
                }}
                className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-full text-sm font-medium hover:brightness-110 transition"
                aria-label={t("cvPdfButton")}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.955 3.129V2.75Z" />
                  <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
                </svg>
                {t("cvPdfButton")}
              </button>
            </div>
          </section>

          <EmailDraft subject={result.emailSubject} body={editedCoverLetter} />
        </div>
      )}
    </div>
  );
}
