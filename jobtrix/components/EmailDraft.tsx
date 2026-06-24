"use client";

import { useState } from "react";
import React from "react";
import { useTranslations } from "next-intl";
import { loadProfile } from "@/lib/profile-storage";
import { openPdfPreview } from "@/components/PdfPreviewModal";
import { CoverLetterDocument, CvDocument } from "@/lib/pdf-documents";
import { downloadCoverLetterPdf, downloadCvPdf, buildFilename } from "@/lib/download-pdf";
import { buildMailtoUrl } from "@/lib/email-utils";
import { detectDevice, isMobileDevice } from "@/lib/device";
import { navigate } from "@/lib/navigate";
import { generateValidatedBlob } from "@/lib/pdf-blob";

interface EmailDraftProps {
  subject: string;
  body: string;
  coverLetter: string;
  cv: string;
  template: "classic" | "modern" | "traditional" | "accent" | "creative";
  cvStyle: "classic" | "american";
  accentColor?: string;
  documentsConfirmed: boolean;
  extractedEmail?: string | null;
}

const FEEDBACK_DURATION_MS = 2000;

function CopyButton({ value, label, testId }: { value: string; label: string; testId: string }) {
  const t = useTranslations("generate");
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), FEEDBACK_DURATION_MS);
  }

  return (
    <button
      type="button"
      data-testid={testId}
      onClick={handleCopy}
      className="rounded-full border border-accent text-accent px-4 py-1.5 text-sm font-semibold hover:bg-accent hover:text-white transition"
    >
      {copied ? t("copied") : label}
    </button>
  );
}

export default function EmailDraft({ subject, body, coverLetter, cv, template, cvStyle, accentColor, documentsConfirmed, extractedEmail }: EmailDraftProps) {
  const t = useTranslations("generate");
  const [recipient, setRecipient] = useState(extractedEmail ?? "");
  const [showPreview, setShowPreview] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [guidePdfs, setGuidePdfs] = useState<{ coverLetterUrl: string; cvUrl: string; coverLetterName: string; cvName: string } | null>(null);

  const canSend = documentsConfirmed && !!recipient && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient);

  async function handleConfirmSend() {
    if (!canSend) return;

    const profile = loadProfile();
    if (!profile) return;

    if (isMobileDevice()) {
      try {
        const clBlob = await generateValidatedBlob(
          React.createElement(CoverLetterDocument, { coverLetter, profile, template, accentColor })
        );
        const cvBlob = await generateValidatedBlob(
          React.createElement(CvDocument, { cv, profile, template, cvStyle, accentColor })
        );
        const clName = buildFilename("Anschreiben", profile.name);
        const cvName = buildFilename("Lebenslauf", profile.name);
        setGuidePdfs({
          coverLetterUrl: URL.createObjectURL(new File([clBlob], clName, { type: "application/pdf" })),
          cvUrl: URL.createObjectURL(new File([cvBlob], cvName, { type: "application/pdf" })),
          coverLetterName: clName,
          cvName: cvName,
        });
      } catch { /* Guide zeigt trotzdem, Nutzer kann manuell herunterladen */ }
      setShowPreview(false);
      setShowGuide(true);
      return;
    }

    try {
      await downloadCoverLetterPdf(coverLetter, profile, template, accentColor);
      await downloadCvPdf(cv, profile, template, cvStyle, accentColor);
    } finally {
      setShowPreview(false);
      setShowGuide(true);
    }
  }

  function handleOpenMailClient() {
    // mailto bewusst per Navigation (kein _blank-Fenster, das mobil die Seite
    // wegreißt und die Downloads abbricht).
    const mailtoUrl = buildMailtoUrl(recipient, subject, body);
    navigate(mailtoUrl);
  }

  return (
    <section data-testid="email-draft-section">
      <h2 className="text-xl font-semibold text-primary dark:text-accent mb-2">{t("emailDraftTitle")}</h2>

      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface p-4 space-y-1">
        <span className="text-xs font-medium text-text/60">{t("emailSubjectLabel")}</span>
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-text">{subject}</p>
          <CopyButton value={subject} label={t("copySubject")} testId="copy-subject-button" />
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface p-4 space-y-2">
        <div className="flex items-center justify-between gap-4">
          <span className="text-xs font-medium text-text/60">{t("emailBodyLabel")}</span>
          <CopyButton value={body} label={t("copyBody")} testId="copy-body-button" />
        </div>
        <p className="whitespace-pre-wrap text-sm text-text">{body}</p>
      </div>

      <div className="mt-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-surface p-4 space-y-3">
        <span className="text-xs font-medium text-text/60">{t("sendEmailTitle")}</span>

        {!documentsConfirmed && (
          <p className="text-sm text-amber-600 dark:text-amber-400" data-testid="confirm-hint">
            {t("sendEmailConfirmHint")}
          </p>
        )}

        <div>
          <label className="text-xs font-medium text-text/60 mb-1 block">{t("sendEmailRecipientLabel")}</label>
          <input
            type="email"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder={t("sendEmailRecipientPlaceholder")}
            disabled={!documentsConfirmed}
            className="w-full border border-gray-300 dark:border-gray-600 dark:bg-surface rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-40"
            aria-label={t("sendEmailRecipientLabel")}
            data-testid="recipient-input"
          />
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            disabled={!canSend}
            className="bg-accent text-white px-6 py-2.5 rounded-full font-semibold text-sm hover:brightness-110 transition disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
            data-testid="send-email-button"
          >
            {t("sendEmailPreviewButton")}
          </button>
        </div>
        <p className="text-xs text-text/50">{t("sendEmailInfo")}</p>

        {showPreview && (
          <div className="rounded-xl border-2 border-accent bg-accent/5 p-4 space-y-3" data-testid="email-preview">
            <h3 className="text-sm font-semibold text-accent">{t("sendEmailPreviewTitle")}</h3>
            <div className="text-sm text-text space-y-1">
              <p><span className="font-medium text-text/60">{t("sendEmailPreviewTo")}:</span> {recipient}</p>
              <p><span className="font-medium text-text/60">{t("emailSubjectLabel")}:</span> {subject}</p>
            </div>
            <div className="rounded-lg bg-white dark:bg-surface border border-gray-200 dark:border-gray-700 p-3">
              <p className="whitespace-pre-wrap text-sm text-text">{body}</p>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-medium text-text/60">{t("sendEmailPreviewAttachments")}:</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const profile = loadProfile();
                    if (profile) openPdfPreview(React.createElement(CoverLetterDocument, { coverLetter, profile, template, accentColor }));
                  }}
                  className="rounded-full border border-accent text-accent px-4 py-1.5 text-sm font-semibold hover:bg-accent hover:text-white transition"
                >
                  {t("sendEmailPreviewCoverLetter")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const profile = loadProfile();
                    if (profile) openPdfPreview(React.createElement(CvDocument, { cv, profile, template, cvStyle, accentColor }));
                  }}
                  className="rounded-full border border-accent text-accent px-4 py-1.5 text-sm font-semibold hover:bg-accent hover:text-white transition"
                >
                  {t("sendEmailPreviewCv")}
                </button>
              </div>
            </div>
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => setShowPreview(false)}
                className="text-sm text-text/60 hover:text-text transition"
              >
                {t("sendEmailPreviewCancel")}
              </button>
              <button
                type="button"
                onClick={handleConfirmSend}
                className="bg-accent text-white px-6 py-2.5 rounded-full font-semibold text-sm hover:brightness-110 transition min-h-[44px]"
                data-testid="confirm-send-button"
              >
                {t("sendEmailConfirmSend")}
              </button>
            </div>
          </div>
        )}
      </div>

      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" role="dialog" aria-modal="true" onClick={() => { setShowGuide(false); if (guidePdfs) { URL.revokeObjectURL(guidePdfs.coverLetterUrl); URL.revokeObjectURL(guidePdfs.cvUrl); setGuidePdfs(null); } }}>
          <div className="bg-white dark:bg-surface border border-gray-200 dark:border-gray-700 rounded-lg p-6 max-w-md mx-4 space-y-4" onClick={(e) => e.stopPropagation()} data-testid="send-guide-popup">
            <h2 className="text-lg font-bold text-primary dark:text-accent">{t("sendGuideTitle")}</h2>
            <ol className="space-y-3 text-sm text-text/80 list-decimal list-inside">
              <li>{t("sendGuideStep1")}</li>
              <li>{t("sendGuideStep2")}</li>
              <li>{t("sendGuideStep3")}</li>
              <li>{t("sendGuideStep4")}</li>
            </ol>
            <p className="text-xs text-accent font-medium">
              {detectDevice() === "android" && t("sendGuideHintAndroid")}
              {detectDevice() === "ios" && t("sendGuideHintIOS")}
              {detectDevice() === "desktop" && t("sendGuideHintDesktop")}
            </p>
            <p className="text-xs text-text/50" data-testid="send-guide-disclaimer">{t("sendGuideDisclaimer")}</p>
            {guidePdfs && (
              <div className="flex gap-2" data-testid="guide-download-links">
                <a
                  href={guidePdfs.coverLetterUrl}
                  download={guidePdfs.coverLetterName}
                  className="flex-1 text-center rounded-lg border-2 border-accent text-accent px-3 py-2.5 text-sm font-semibold hover:bg-accent hover:text-white transition min-h-[44px]"
                >
                  {t("sendGuideDownloadCoverLetter")}
                </a>
                <a
                  href={guidePdfs.cvUrl}
                  download={guidePdfs.cvName}
                  className="flex-1 text-center rounded-lg border-2 border-accent text-accent px-3 py-2.5 text-sm font-semibold hover:bg-accent hover:text-white transition min-h-[44px]"
                >
                  {t("sendGuideDownloadCv")}
                </a>
              </div>
            )}
            <div className="flex flex-col gap-3">
              <button
                type="button"
                autoFocus
                onClick={handleOpenMailClient}
                className="w-full bg-accent text-white px-6 py-3 rounded-lg font-semibold text-sm hover:brightness-110 transition min-h-[44px]"
                data-testid="open-mail-client-button"
              >
                {t("sendGuideOpenMail")}
              </button>
              <button
                type="button"
                onClick={() => setShowGuide(false)}
                className="w-full border border-gray-300 dark:border-gray-600 text-text/70 px-6 py-3 rounded-lg font-semibold text-sm hover:border-accent hover:text-accent transition min-h-[44px]"
              >
                {t("sendGuideOk")}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
