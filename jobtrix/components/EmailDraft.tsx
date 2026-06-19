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

export default function EmailDraft({ subject, body, coverLetter, cv, template, cvStyle, accentColor }: EmailDraftProps) {
  const t = useTranslations("generate");
  const [recipient, setRecipient] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [sendError, setSendError] = useState(false);

  async function handleSend() {
    if (!recipient || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient)) return;

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
            <div className="flex gap-2">
              <input
                type="email"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder={t("sendEmailRecipientPlaceholder")}
                className="flex-1 border border-gray-300 dark:border-gray-600 dark:bg-surface rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                aria-label={t("sendEmailRecipientLabel")}
                data-testid="recipient-input"
              />
              <button
                type="button"
                onClick={handleSend}
                disabled={sending || !recipient}
                className="bg-accent text-white px-6 py-2.5 rounded-full font-semibold text-sm hover:brightness-110 transition disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
                data-testid="send-email-button"
              >
                {sending ? t("sendEmailSending") : t("sendEmailButton")}
              </button>
            </div>
            <p className="text-xs text-text/50">{t("sendEmailInfo")}</p>
            {sendError && (
              <p className="text-sm text-red-600 dark:text-red-400" role="alert">{t("sendEmailError")}</p>
            )}
          </>
        )}
      </div>
    </section>
  );
}
