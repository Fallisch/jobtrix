"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

interface EmailDraftProps {
  subject: string;
  body: string;
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

export default function EmailDraft({ subject, body }: EmailDraftProps) {
  const t = useTranslations("generate");
  const [emailConfirmed, setEmailConfirmed] = useState(false);

  const mailtoHref = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

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

      <div className="mt-4 space-y-3">
        <p className="text-sm text-text/60">{t("sendEmailAttachmentHint")}</p>
        <label className="flex items-center gap-2 text-sm text-text/70">
          <input
            type="checkbox"
            checked={emailConfirmed}
            onChange={(e) => setEmailConfirmed(e.target.checked)}
            data-testid="email-confirm-checkbox"
            className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-accent focus:ring-accent"
          />
          {t("sendEmailConfirm")}
        </label>
        <a
          href={mailtoHref}
          aria-label={t("sendEmailButton")}
          aria-disabled={!emailConfirmed}
          onClick={(e) => { if (!emailConfirmed) e.preventDefault(); }}
          className={`inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold transition ${
            emailConfirmed
              ? "bg-accent text-white hover:brightness-110"
              : "bg-accent/40 text-white/60 cursor-not-allowed"
          }`}
        >
          {t("sendEmailButton")}
        </a>
      </div>
    </section>
  );
}
