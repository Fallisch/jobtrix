"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { loadProfile } from "@/lib/profile-storage";

interface GenerateResult {
  coverLetter: string;
  cv: string;
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
        <div data-testid="loading-animation" className="rounded-2xl bg-gray-100 p-8 animate-pulse space-y-3">
          <div className="h-4 bg-gray-300 rounded w-3/4" />
          <div className="h-4 bg-gray-300 rounded w-1/2" />
          <div className="h-4 bg-gray-300 rounded w-2/3" />
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
          </section>
        </div>
      )}
    </div>
  );
}
