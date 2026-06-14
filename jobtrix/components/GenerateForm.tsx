"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter, useParams } from "next/navigation";
import { loadProfile, saveProfile } from "@/lib/profile-storage";
import EmailDraft from "@/components/EmailDraft";
import { downloadCoverLetterPdf, downloadCvPdf } from "@/lib/download-pdf";

const ACCENT_COLORS = [
  "#1E3A5F",
  "#1A5C38",
  "#5C1A1A",
  "#2D2D5C",
  "#5C3D1A",
  "#374151",
];

interface GenerateResult {
  coverLetter: string;
  cv: string;
  emailSubject: string;
}

interface JobSearchResult {
  title: string;
  company: string;
  location: string;
  description: string | null;
  url: string;
}

export default function GenerateForm() {
  const t = useTranslations("generate");
  const router = useRouter();
  const { locale } = useParams<{ locale: string }>();
  const [jobPosting, setJobPosting] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [hasProfile, setHasProfile] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editedCoverLetter, setEditedCoverLetter] = useState("");
  const [editedCv, setEditedCv] = useState("");
  const [coverLetterAgreed, setCoverLetterAgreed] = useState(false);
  const [cvAgreed, setCvAgreed] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<"classic" | "modern" | "traditional" | "accent" | "creative">("classic");
  const [cvStyle, setCvStyle] = useState<"classic" | "american">("classic");
  const [accentColor, setAccentColor] = useState<string>("#1E3A5F");
  const [jobSearchField, setJobSearchField] = useState("");
  const [jobSearchLocation, setJobSearchLocation] = useState("");
  const [jobSearchLoading, setJobSearchLoading] = useState(false);
  const [jobSearchPerformed, setJobSearchPerformed] = useState(false);
  const [jobResults, setJobResults] = useState<JobSearchResult[]>([]);

  useEffect(() => {
    setHasProfile(loadProfile() !== null);
    (async () => {
      try {
        const res = await fetch("/api/profile");
        if (!res?.ok) return;
        const data = await res.json();
        if (data?.name) {
          saveProfile(data);
          setHasProfile(true);
        }
      } catch {
        // Kein gespeichertes Profil in Postgres erreichbar – lokales Profil bleibt maßgeblich.
      }
    })();
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
        body: JSON.stringify({ jobPosting, jobTitle, companyName, contactPerson, profile, cvStyle, template: selectedTemplate, accentColor }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error === "access_required") {
          router.push(`/${locale}/pricing`);
          return;
        }
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

  async function handleJobSearch() {
    setJobSearchLoading(true);
    setJobSearchPerformed(true);
    try {
      const params = new URLSearchParams();
      if (jobSearchField.trim()) params.set("was", jobSearchField.trim());
      if (jobSearchLocation.trim()) params.set("wo", jobSearchLocation.trim());

      const res = await fetch(`/api/jobsuche?${params.toString()}`);
      const data = await res.json();
      setJobResults(Array.isArray(data?.results) ? data.results : []);
    } catch {
      setJobResults([]);
    } finally {
      setJobSearchLoading(false);
    }
  }

  function handleJobResultClick(result: JobSearchResult) {
    if (result.description) {
      setJobPosting(result.description);
    } else {
      window.open(result.url, "_blank");
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-3xl font-bold text-primary dark:text-accent">{t("title")}</h1>

      <div className="space-y-4">
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface p-4 space-y-3">
          <h2 className="text-sm font-semibold text-text">{t("jobSearchTitle")}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3">
            <input
              id="jobSearchField"
              type="text"
              value={jobSearchField}
              onChange={(e) => setJobSearchField(e.target.value)}
              placeholder={t("jobSearchFieldPlaceholder")}
              aria-label={t("jobSearchFieldLabel")}
              className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface px-4 py-2.5 text-sm text-text placeholder:text-text/40 focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <input
              id="jobSearchLocation"
              type="text"
              value={jobSearchLocation}
              onChange={(e) => setJobSearchLocation(e.target.value)}
              placeholder={t("jobSearchLocationPlaceholder")}
              aria-label={t("jobSearchLocationLabel")}
              className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface px-4 py-2.5 text-sm text-text placeholder:text-text/40 focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <button
              type="button"
              onClick={handleJobSearch}
              disabled={jobSearchLoading}
              className="rounded-xl bg-accent text-white px-5 py-2.5 text-sm font-semibold hover:brightness-110 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {jobSearchLoading ? t("jobSearchSearching") : t("jobSearchButton")}
            </button>
          </div>

          {jobSearchPerformed && (
            jobResults.length === 0 ? (
              <p className="text-sm text-text/60">{t("jobSearchNoResults")}</p>
            ) : (
              <div className="space-y-2">
                {jobResults.map((result, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-3 flex items-start justify-between gap-3"
                  >
                    <button
                      type="button"
                      data-testid={`job-result-${i}`}
                      onClick={() => handleJobResultClick(result)}
                      className="text-left flex-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                    >
                      <p className="font-semibold text-text">{result.title}</p>
                      <p className="text-sm text-text/60">{result.company} · {result.location}</p>
                    </button>
                    <a
                      href={result.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-accent hover:underline whitespace-nowrap shrink-0"
                    >
                      {t("jobSearchViewOriginal")}
                    </a>
                  </div>
                ))}
              </div>
            )
          )}
        </div>

        <div>
          <label htmlFor="jobPosting" className="block text-sm font-medium text-text mb-1">
            {t("jobPostingLabel")}
          </label>
          <textarea
            id="jobPosting"
            value={jobPosting}
            onChange={(e) => setJobPosting(e.target.value)}
            rows={8}
            className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface px-4 py-3 text-sm text-text placeholder:text-text/40 focus:outline-none focus:ring-2 focus:ring-accent resize-y"
            placeholder={t("jobPostingPlaceholder")}
            aria-label={t("jobPostingLabel")}
          />
        </div>

        <div>
          <label htmlFor="jobTitle" className="block text-sm font-medium text-text mb-1">
            {t("jobTitleLabel")}
          </label>
          <input
            id="jobTitle"
            type="text"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface px-4 py-3 text-sm text-text placeholder:text-text/40 focus:outline-none focus:ring-2 focus:ring-accent"
            placeholder={t("optional")}
            aria-label={t("jobTitleLabel")}
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
              className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface px-4 py-3 text-sm text-text placeholder:text-text/40 focus:outline-none focus:ring-2 focus:ring-accent"
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
              className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface px-4 py-3 text-sm text-text placeholder:text-text/40 focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder={t("optional")}
              aria-label={t("contactPersonLabel")}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleGenerate}
            disabled={!canGenerate || loading}
            className="w-full sm:w-auto bg-accent text-white px-8 py-3 rounded-full font-semibold text-base hover:brightness-110 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {t("generateButton")}
          </button>
          <div className="flex items-center gap-2">
            <span className="text-sm text-text/60">{t("cvStyleLabel")}:</span>
            <button
              type="button"
              onClick={() => setCvStyle("classic")}
              aria-pressed={cvStyle === "classic"}
              aria-label={t("cvStyleClassic")}
              className={`rounded-full px-3.5 py-1.5 text-sm font-semibold border transition ${
                cvStyle === "classic"
                  ? "bg-accent text-white border-accent"
                  : "border-gray-200 dark:border-gray-700 text-text hover:border-accent hover:text-accent"
              }`}
            >
              {t("cvStyleClassic")}
            </button>
            <button
              type="button"
              onClick={() => setCvStyle("american")}
              aria-pressed={cvStyle === "american"}
              aria-label={t("cvStyleAmerican")}
              className={`rounded-full px-3.5 py-1.5 text-sm font-semibold border transition ${
                cvStyle === "american"
                  ? "bg-accent text-white border-accent"
                  : "border-gray-200 dark:border-gray-700 text-text hover:border-accent hover:text-accent"
              }`}
            >
              {t("cvStyleAmerican")}
            </button>
          </div>
        </div>
      </div>

      {loading && (
        <div data-testid="loading-animation" className="rounded-2xl bg-gray-100 dark:bg-gray-800 p-8 flex flex-col items-center gap-4">
          <div
            data-testid="loading-spinner"
            className="animate-spin h-14 w-14 rounded-full border-4 border-accent/20 border-t-accent flex items-center justify-center"
          >
            <span className="text-xs font-bold text-primary dark:text-accent">J</span>
          </div>
          <p className="text-sm text-text/60">{t("loading")}</p>
        </div>
      )}

      {error && (
        <div role="alert" className="rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 px-4 py-3 text-red-700 dark:text-red-300 text-sm">
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-text">{t("templateLabel")}:</span>
            <button
              onClick={() => setSelectedTemplate("classic")}
              aria-pressed={selectedTemplate === "classic"}
              aria-label={t("templateClassic")}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold border transition ${
                selectedTemplate === "classic"
                  ? "bg-accent text-white border-accent"
                  : "border-gray-200 dark:border-gray-700 text-text hover:border-accent hover:text-accent"
              }`}
            >
              {t("templateClassic")}
            </button>
            <button
              onClick={() => setSelectedTemplate("modern")}
              aria-pressed={selectedTemplate === "modern"}
              aria-label={t("templateModern")}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold border transition ${
                selectedTemplate === "modern"
                  ? "bg-accent text-white border-accent"
                  : "border-gray-200 dark:border-gray-700 text-text hover:border-accent hover:text-accent"
              }`}
            >
              {t("templateModern")}
            </button>
            <button
              onClick={() => setSelectedTemplate("traditional")}
              aria-pressed={selectedTemplate === "traditional"}
              aria-label={t("templateTraditional")}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold border transition ${
                selectedTemplate === "traditional"
                  ? "bg-accent text-white border-accent"
                  : "border-gray-200 dark:border-gray-700 text-text hover:border-accent hover:text-accent"
              }`}
            >
              {t("templateTraditional")}
            </button>
            <button
              onClick={() => setSelectedTemplate("accent")}
              aria-pressed={selectedTemplate === "accent"}
              aria-label={t("templateAccent")}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold border transition ${
                selectedTemplate === "accent"
                  ? "bg-accent text-white border-accent"
                  : "border-gray-200 dark:border-gray-700 text-text hover:border-accent hover:text-accent"
              }`}
            >
              {t("templateAccent")}
            </button>
            <button
              onClick={() => setSelectedTemplate("creative")}
              aria-pressed={selectedTemplate === "creative"}
              aria-label={t("templateCreative")}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold border transition ${
                selectedTemplate === "creative"
                  ? "bg-accent text-white border-accent"
                  : "border-gray-200 dark:border-gray-700 text-text hover:border-accent hover:text-accent"
              }`}
            >
              {t("templateCreative")}
            </button>

            {(selectedTemplate === "modern" || selectedTemplate === "accent" || selectedTemplate === "creative") && (
              <div className="flex items-center gap-2 ml-2" data-testid="color-palette">
                <span className="text-sm text-text/50">Farbe:</span>
                {ACCENT_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setAccentColor(color)}
                    aria-label={`Farbe ${color}`}
                    aria-pressed={accentColor === color}
                    className={`w-6 h-6 rounded-full border-2 transition-all hover:scale-110 ${
                      accentColor === color
                        ? "border-white ring-2 ring-offset-1 ring-gray-400 dark:ring-offset-background scale-110"
                        : "border-transparent"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            )}
          </div>
          <section className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-gray-700 bg-surface">
              <h2 className="text-base font-semibold text-primary dark:text-accent">{t("coverLetterTitle")}</h2>
              <button
                onClick={() => {
                  const profile = loadProfile();
                  if (profile) downloadCoverLetterPdf(editedCoverLetter, profile, selectedTemplate, accentColor);
                }}
                disabled={!coverLetterAgreed}
                className="inline-flex items-center gap-1.5 rounded-full border border-accent text-accent px-3.5 py-1.5 text-sm font-semibold hover:bg-accent hover:text-white transition disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-accent"
                aria-label={t("coverLetterPdfButton")}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                  <path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.955 3.129V2.75Z" />
                  <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
                </svg>
                PDF
              </button>
            </div>
            <textarea
              value={editedCoverLetter}
              onChange={(e) => {
                setEditedCoverLetter(e.target.value);
                setCoverLetterAgreed(false);
              }}
              rows={12}
              className="w-full px-5 py-4 text-sm text-text bg-transparent focus:outline-none resize-y"
              aria-label={t("coverLetterTitle")}
            />
            <label className="flex items-center gap-2 px-5 pb-4 text-sm text-text/70">
              <input
                type="checkbox"
                checked={coverLetterAgreed}
                onChange={(e) => setCoverLetterAgreed(e.target.checked)}
                data-testid="cover-letter-agree-checkbox"
                className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-accent focus:ring-accent"
              />
              {t("confirmReadAgree")}
            </label>
          </section>

          <section className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-gray-700 bg-surface">
              <h2 className="text-base font-semibold text-primary dark:text-accent">{t("cvTitle")}</h2>
              <button
                onClick={() => {
                  const profile = loadProfile();
                  if (profile) downloadCvPdf(editedCv, profile, selectedTemplate, cvStyle, accentColor);
                }}
                disabled={!cvAgreed}
                className="inline-flex items-center gap-1.5 rounded-full border border-accent text-accent px-3.5 py-1.5 text-sm font-semibold hover:bg-accent hover:text-white transition disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-accent"
                aria-label={t("cvPdfButton")}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                  <path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.955 3.129V2.75Z" />
                  <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
                </svg>
                PDF
              </button>
            </div>
            <textarea
              value={editedCv}
              onChange={(e) => {
                setEditedCv(e.target.value);
                setCvAgreed(false);
              }}
              rows={12}
              className="w-full px-5 py-4 text-sm text-text bg-transparent focus:outline-none resize-y"
              aria-label={t("cvTitle")}
            />
            <label className="flex items-center gap-2 px-5 pb-4 text-sm text-text/70">
              <input
                type="checkbox"
                checked={cvAgreed}
                onChange={(e) => setCvAgreed(e.target.checked)}
                data-testid="cv-agree-checkbox"
                className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-accent focus:ring-accent"
              />
              {t("confirmReadAgree")}
            </label>
          </section>

          <EmailDraft subject={result.emailSubject} body={editedCoverLetter} />
        </div>
      )}
    </div>
  );
}
