"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter, useParams } from "next/navigation";
import { loadProfile, saveProfile } from "@/lib/profile-storage";
import EmailDraft from "@/components/EmailDraft";
import { downloadCoverLetterPdf, downloadCvPdf, buildFilename } from "@/lib/download-pdf";
import { extractEmail } from "@/lib/email-utils";
import LayoutPreview from "@/components/LayoutPreview";
import { openPdfPreview, PdfPreviewHost } from "@/components/PdfPreviewModal";
import React from "react";
import { CoverLetterDocument, CvDocument } from "@/lib/pdf-documents";

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
  emailBody: string;
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
  const [hasProfile, setHasProfile] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editedCoverLetter, setEditedCoverLetter] = useState("");
  const [editedCv, setEditedCv] = useState("");
  const [coverLetterAgreed, setCoverLetterAgreed] = useState(false);
  const [cvAgreed, setCvAgreed] = useState(false);
  const [coverLetterHighlight, setCoverLetterHighlight] = useState(false);
  const [cvHighlight, setCvHighlight] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<"classic" | "modern" | "traditional" | "accent" | "creative">("classic");
  const [cvStyle, setCvStyle] = useState<"classic" | "american">("american");
  const [accentColor, setAccentColor] = useState<string>("#1E3A5F");
  const [isInitiativbewerbung, setIsInitiativbewerbung] = useState(false);
  const [targetCompany, setTargetCompany] = useState("");
  const [jobSearchQuery, setJobSearchQuery] = useState("");
  const [jobSearchLocation, setJobSearchLocation] = useState("");
  const [jobSearchRadius, setJobSearchRadius] = useState("25");
  const [jobSearchLoading, setJobSearchLoading] = useState(false);
  const [jobSearchPerformed, setJobSearchPerformed] = useState(false);
  const [jobResults, setJobResults] = useState<JobSearchResult[]>([]);
  const [externalHintVisible, setExternalHintVisible] = useState(false);
  const [adoptedHintVisible, setAdoptedHintVisible] = useState(false);
  const [pasteFieldVisible, setPasteFieldVisible] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [extractLoadingIndex, setExtractLoadingIndex] = useState<number | null>(null);
  const [showProfileHint, setShowProfileHint] = useState(false);

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

  const canGenerate = hasProfile && (isInitiativbewerbung ? targetCompany.trim().length > 0 : jobPosting.trim().length > 0);

  function isProfileSparse(): boolean {
    const profile = loadProfile();
    if (!profile) return true;
    const hasQualification = profile.qualifications.length > 0;
    const hasEducation = profile.education.some((e) => e.institution || e.degree);
    return !hasQualification || !hasEducation;
  }

  function handleGenerateClick() {
    if (isProfileSparse()) {
      setShowProfileHint(true);
    } else {
      handleGenerate();
    }
  }

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    setResult(null);

    const profile = loadProfile();
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobPosting, profile, cvStyle, template: selectedTemplate, accentColor, isInitiativbewerbung, targetCompany }),
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
      if (jobSearchQuery.trim()) params.set("was", jobSearchQuery.trim());
      if (jobSearchLocation.trim()) params.set("wo", jobSearchLocation.trim());
      if (jobSearchRadius) params.set("umkreis", jobSearchRadius);

      const res = await fetch(`/api/jobsuche?${params.toString()}`);
      const data = await res.json();
      setJobResults(Array.isArray(data?.results) ? data.results : []);
    } catch {
      setJobResults([]);
    } finally {
      setJobSearchLoading(false);
    }
  }

  function adoptText(text: string) {
    setJobPosting(text);
    setExternalHintVisible(false);
    setPasteFieldVisible(false);
    setPasteText("");
    setAdoptedHintVisible(true);
    setTimeout(() => setAdoptedHintVisible(false), 4000);
  }

  function showExternalFallback(url: string) {
    window.open(url, "_blank");
    setExternalHintVisible(true);
    setPasteFieldVisible(true);
    setAdoptedHintVisible(false);
  }

  async function handleJobResultClick(result: JobSearchResult, index: number) {
    // Interne BA-Anzeige: Beschreibungstext liegt schon vor.
    if (result.description) {
      adoptText(result.description);
      return;
    }

    // Externe Anzeige: Server versucht, den Anzeigentext zu holen.
    setExtractLoadingIndex(index);
    setExternalHintVisible(false);
    try {
      const res = await fetch("/api/jobsuche/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: result.url }),
      });
      const data = res.ok ? await res.json() : null;
      if (data?.text) {
        adoptText(data.text);
        return;
      }
    } catch {
      // Netzwerkfehler → Fallback unten.
    } finally {
      setExtractLoadingIndex(null);
    }

    // Abruf fehlgeschlagen/zu wenig Text → externen Link öffnen + Einfügefeld.
    showExternalFallback(result.url);
  }

  function handleAdoptPaste() {
    const trimmed = pasteText.trim();
    if (!trimmed) return;
    adoptText(trimmed);
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6 relative">
      {adoptedHintVisible && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-green-600 text-white px-6 py-3 rounded-full shadow-lg text-sm font-semibold animate-bounce">
          {t("jobSearchAdoptedHint")}
        </div>
      )}
      <h1 className="text-3xl font-bold text-primary dark:text-accent">{t("title")}</h1>

      <div className="space-y-4">
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface p-4 space-y-3">
          <h2 className="text-sm font-semibold text-text">{t("jobSearchTitle")}</h2>
          <div className="space-y-3">
            <input
              id="jobSearchQuery"
              type="text"
              value={jobSearchQuery}
              onChange={(e) => setJobSearchQuery(e.target.value)}
              placeholder={t("jobSearchQueryPlaceholder")}
              aria-label={t("jobSearchQueryLabel")}
              className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface px-4 py-3 text-sm text-text placeholder:text-text/40 focus:outline-none focus:ring-2 focus:ring-accent"
              onKeyDown={(e) => e.key === "Enter" && handleJobSearch()}
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
            <div className="flex items-center gap-3">
              <span className="text-sm text-text/60 whitespace-nowrap">{t("jobSearchRadiusLabel")}:</span>
              <select
                id="jobSearchRadius"
                value={jobSearchRadius}
                onChange={(e) => setJobSearchRadius(e.target.value)}
                aria-label={t("jobSearchRadiusLabel")}
                className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface px-4 py-2.5 text-sm text-text focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="0">0 km</option>
                <option value="5">5 km</option>
                <option value="10">10 km</option>
                <option value="25">25 km</option>
                <option value="50">50 km</option>
                <option value="100">100 km</option>
                <option value="200">200 km</option>
              </select>
              <button
                type="button"
                onClick={handleJobSearch}
                disabled={jobSearchLoading}
                className="rounded-xl bg-accent text-white px-5 py-2.5 text-sm font-semibold hover:brightness-110 transition disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {jobSearchLoading ? t("jobSearchSearching") : t("jobSearchButton")}
              </button>
            </div>
          </div>

          {jobSearchPerformed && (
            jobResults.length === 0 ? (
              <p className="text-sm text-text/60">{t("jobSearchNoResults")}</p>
            ) : (
              <div className="space-y-2">
                {externalHintVisible && (
                  <p className="text-sm text-amber-600 dark:text-amber-400">{t("jobSearchExternalHint")}</p>
                )}
                {jobResults.map((result, i) => (
                  <div
                    key={i}
                    data-testid={`job-result-container-${i}`}
                    className="rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-3 flex items-start justify-between gap-3"
                  >
                    <button
                      type="button"
                      data-testid={`job-result-${i}`}
                      onClick={() => handleJobResultClick(result, i)}
                      disabled={extractLoadingIndex !== null}
                      className="text-left flex-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-60"
                    >
                      <p className="font-semibold text-text">
                        {result.title}
                        {!result.description && (
                          <span data-testid="external-badge" className="ml-2 inline-flex items-center text-xs font-medium text-amber-600 dark:text-amber-400">↗ {t("jobSearchExternalBadge")}</span>
                        )}
                        {extractLoadingIndex === i && (
                          <span data-testid={`extract-loading-${i}`} className="ml-2 text-xs text-text/50">{t("jobSearchExtracting")}</span>
                        )}
                      </p>
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

        {pasteFieldVisible && (
          <div className="rounded-2xl border border-amber-300 dark:border-amber-700 bg-amber-50/60 dark:bg-amber-950/20 p-4 space-y-2" data-testid="external-paste-field">
            <p className="text-sm font-medium text-text">{t("jobSearchPasteTitle")}</p>
            <p className="text-sm text-text/60">{t("jobSearchPasteHint")}</p>
            <textarea
              id="jobSearchPaste"
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              rows={5}
              placeholder={t("jobSearchPastePlaceholder")}
              aria-label={t("jobSearchPasteLabel")}
              className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface px-4 py-3 text-sm text-text placeholder:text-text/40 focus:outline-none focus:ring-2 focus:ring-accent resize-y"
            />
            <button
              type="button"
              onClick={handleAdoptPaste}
              disabled={!pasteText.trim()}
              className="rounded-full bg-accent text-white px-5 py-2 text-sm font-semibold hover:brightness-110 transition disabled:opacity-40 disabled:cursor-not-allowed min-h-[44px]"
            >
              {t("jobSearchPasteAdopt")}
            </button>
          </div>
        )}

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="initiativbewerbung"
            checked={isInitiativbewerbung}
            onChange={(e) => setIsInitiativbewerbung(e.target.checked)}
            className="w-4 h-4 accent-accent cursor-pointer"
          />
          <label htmlFor="initiativbewerbung" className="text-sm font-medium text-text cursor-pointer select-none">
            {t("initiativbewerbungLabel")}
          </label>
        </div>

        {isInitiativbewerbung ? (
          <div>
            <label htmlFor="targetCompany" className="block text-sm font-medium text-text mb-1">
              {t("targetCompanyLabel")}
            </label>
            <input
              id="targetCompany"
              type="text"
              value={targetCompany}
              onChange={(e) => setTargetCompany(e.target.value)}
              placeholder={t("targetCompanyPlaceholder")}
              aria-label={t("targetCompanyLabel")}
              className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface px-4 py-3 text-sm text-text placeholder:text-text/40 focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
        ) : (
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
        )}

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleGenerateClick}
            disabled={!canGenerate || loading}
            className="w-full sm:w-auto bg-accent text-white px-8 py-3 rounded-full font-semibold text-base hover:brightness-110 transition disabled:opacity-40 disabled:cursor-not-allowed min-h-[44px]"
          >
            {t("generateButton")}
          </button>
          <div className="flex items-center gap-2">
            <span className="text-sm text-text/60">{t("cvStyleLabel")}:</span>
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
          <div>
            <span className="text-sm font-medium text-text block mb-2">{t("templateLabel")}:</span>
            <div className="flex flex-wrap gap-3">
              {(["classic", "modern", "traditional", "accent", "creative"] as const).map((tmpl) => (
                <button
                  key={tmpl}
                  onClick={() => setSelectedTemplate(tmpl)}
                  aria-pressed={selectedTemplate === tmpl}
                  aria-label={t(`template${tmpl.charAt(0).toUpperCase()}${tmpl.slice(1)}` as "templateClassic")}
                  className={`flex flex-col items-center gap-1.5 rounded-xl p-2 border-2 transition ${
                    selectedTemplate === tmpl
                      ? "border-accent bg-accent/5"
                      : "border-transparent hover:border-accent/30"
                  }`}
                >
                  <LayoutPreview template={tmpl} />
                  <span className={`text-xs font-semibold ${selectedTemplate === tmpl ? "text-accent" : "text-text/70"}`}>
                    {t(`template${tmpl.charAt(0).toUpperCase()}${tmpl.slice(1)}` as "templateClassic")}
                  </span>
                </button>
              ))}
            </div>

            {(selectedTemplate === "modern" || selectedTemplate === "accent" || selectedTemplate === "creative") && (
              <div className="flex items-center gap-2 mt-2" data-testid="color-palette">
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
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const profile = loadProfile();
                    if (profile) openPdfPreview(React.createElement(CoverLetterDocument, { coverLetter: editedCoverLetter, profile, template: selectedTemplate, accentColor }), buildFilename("Anschreiben", profile.name));
                  }}
                  className="rounded-full border border-gray-300 dark:border-gray-600 text-text/60 px-3.5 py-1.5 text-sm font-semibold hover:border-accent hover:text-accent transition"
                  aria-label={t("pdfPreviewButton")}
                >
                  {t("pdfPreviewButton")}
                </button>
                <button
                  onClick={() => {
                    if (!coverLetterAgreed) {
                      setCoverLetterHighlight(true);
                      document.querySelector<HTMLInputElement>('[data-testid="cover-letter-agree-checkbox"]')?.focus();
                      return;
                    }
                    const profile = loadProfile();
                    if (profile) downloadCoverLetterPdf(editedCoverLetter, profile, selectedTemplate, accentColor);
                  }}
                  className={`inline-flex items-center gap-1.5 rounded-full border border-accent text-accent px-3.5 py-1.5 text-sm font-semibold hover:bg-accent hover:text-white transition ${!coverLetterAgreed ? "opacity-40" : ""}`}
                  aria-label={t("coverLetterPdfButton")}
                >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                  <path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.955 3.129V2.75Z" />
                  <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
                </svg>
                PDF
                </button>
              </div>
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
            <label className={`flex items-center gap-2 px-5 pb-4 text-sm text-text/70 rounded ${coverLetterHighlight ? "ring-2 ring-red-500" : ""}`}>
              <input
                type="checkbox"
                checked={coverLetterAgreed}
                onChange={(e) => {
                  setCoverLetterAgreed(e.target.checked);
                  if (e.target.checked) setCoverLetterHighlight(false);
                }}
                data-testid="cover-letter-agree-checkbox"
                className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-accent focus:ring-accent"
              />
              {t("confirmReadAgree")}
            </label>
          </section>

          <section className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-gray-700 bg-surface">
              <h2 className="text-base font-semibold text-primary dark:text-accent">{t("cvTitle")}</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const profile = loadProfile();
                    if (profile) openPdfPreview(React.createElement(CvDocument, { cv: editedCv, profile, template: selectedTemplate, cvStyle, accentColor }), buildFilename("Lebenslauf", profile.name));
                  }}
                  className="rounded-full border border-gray-300 dark:border-gray-600 text-text/60 px-3.5 py-1.5 text-sm font-semibold hover:border-accent hover:text-accent transition"
                  aria-label={t("pdfPreviewButton")}
                >
                  {t("pdfPreviewButton")}
                </button>
                <button
                  onClick={() => {
                    if (!cvAgreed) {
                      setCvHighlight(true);
                      document.querySelector<HTMLInputElement>('[data-testid="cv-agree-checkbox"]')?.focus();
                      return;
                    }
                    const profile = loadProfile();
                    if (profile) downloadCvPdf(editedCv, profile, selectedTemplate, cvStyle, accentColor);
                  }}
                  className={`inline-flex items-center gap-1.5 rounded-full border border-accent text-accent px-3.5 py-1.5 text-sm font-semibold hover:bg-accent hover:text-white transition ${!cvAgreed ? "opacity-40" : ""}`}
                  aria-label={t("cvPdfButton")}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                    <path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.955 3.129V2.75Z" />
                    <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
                  </svg>
                  PDF
                </button>
              </div>
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
            <label className={`flex items-center gap-2 px-5 pb-4 text-sm text-text/70 rounded ${cvHighlight ? "ring-2 ring-red-500" : ""}`}>
              <input
                type="checkbox"
                checked={cvAgreed}
                onChange={(e) => {
                  setCvAgreed(e.target.checked);
                  if (e.target.checked) setCvHighlight(false);
                }}
                data-testid="cv-agree-checkbox"
                className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-accent focus:ring-accent"
              />
              {t("confirmReadAgree")}
            </label>
          </section>

          <EmailDraft
            subject={result.emailSubject}
            body={result.emailBody ?? editedCoverLetter}
            coverLetter={editedCoverLetter}
            cv={editedCv}
            template={selectedTemplate}
            cvStyle={cvStyle}
            accentColor={accentColor}
            documentsConfirmed={coverLetterAgreed && cvAgreed}
            extractedEmail={extractEmail(jobPosting)}
          />
        </div>
      )}
      {showProfileHint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" role="dialog" aria-modal="true">
          <div className="bg-white dark:bg-surface border border-gray-200 dark:border-gray-700 rounded-lg p-6 max-w-md mx-4 space-y-4">
            <h2 className="text-lg font-bold text-primary dark:text-accent">{t("profileHintTitle")}</h2>
            <p className="text-sm text-text/80">{t("profileHintMessage")}</p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => { setShowProfileHint(false); router.push(`/${locale}/profile`); }}
                className="px-4 py-2 text-sm font-semibold text-accent border border-accent rounded-lg hover:bg-accent/10 transition"
              >
                {t("profileHintGoToProfile")}
              </button>
              <button
                type="button"
                onClick={() => { setShowProfileHint(false); handleGenerate(); }}
                className="px-4 py-2 text-sm font-semibold bg-accent text-white rounded-lg hover:brightness-110 transition"
              >
                {t("profileHintContinue")}
              </button>
            </div>
          </div>
        </div>
      )}
      <PdfPreviewHost />
    </div>
  );
}
