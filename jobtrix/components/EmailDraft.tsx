"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { loadProfile } from "@/lib/profile-storage";

interface EmailDraftProps {
  subject: string;
  body: string;
  coverLetter: string;
  cv: string;
  template: "classic" | "modern" | "traditional" | "accent" | "creative";
  cvStyle: "classic" | "american";
  accentColor?: string;
  documentsConfirmed: boolean;
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

export default function EmailDraft({ subject, body, coverLetter, cv, template, cvStyle, accentColor, documentsConfirmed }: EmailDraftProps) {
  const t = useTranslations("generate");
  const [recipient, setRecipient] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [sendError, setSendError] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const canSend = documentsConfirmed && !!recipient && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient);

  async function handleSend() {
    if (!canSend) return;

    const profile = loadProfile();
    if (!profile) return;

    setSending(true);
    setSendError(false);

    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: recipient,
          subject,
          body,
          coverLetter,
          cv,
          profile,
          template,
          cvStyle,
          accentColor,
        }),
      });

      if (res.ok) {
        setSent(true);
        setShowPreview(false);
      } else {
        setSendError(true);
      }
    } catch {
      setSendError(true);
    } finally {
      setSending(false);
    }
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

        {sent ? (
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400" data-testid="send-success">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" /></svg>
            <span className="text-sm font-medium">{t("sendEmailSuccess")}</span>
          </div>
        ) : (
          <>
            {!documentsConfirmed && (
              <p className="text-sm text-amber-600 dark:text-amber-400" data-testid="confirm-hint">
                {t("sendEmailConfirmHint")}
              </p>
            )}

            <div className="flex gap-2">
              <input
                type="email"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder={t("sendEmailRecipientPlaceholder")}
                disabled={!documentsConfirmed}
                className="flex-1 border border-gray-300 dark:border-gray-600 dark:bg-surface rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-40"
                aria-label={t("sendEmailRecipientLabel")}
                data-testid="recipient-input"
              />
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
            {sendError && (
              <p className="text-sm text-red-600 dark:text-red-400" role="alert">{t("sendEmailError")}</p>
            )}

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
                <p className="text-xs text-text/50">{t("sendEmailPreviewAttachments")}</p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowPreview(false)}
                    className="text-sm text-text/60 hover:text-text transition"
                  >
                    {t("sendEmailPreviewCancel")}
                  </button>
                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={sending}
                    className="bg-accent text-white px-6 py-2.5 rounded-full font-semibold text-sm hover:brightness-110 transition disabled:opacity-40"
                  >
                    {sending ? t("sendEmailSending") : t("sendEmailConfirmSend")}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
