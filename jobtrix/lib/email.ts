const RESEND_API = "https://api.resend.com/emails";
const FETCH_TIMEOUT_MS = 15_000;

function fetchWithTimeout(url: string, options: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(timer));
}

function getConfig() {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL ?? "JobTRIX <noreply@jobtrix.de>";
  return { apiKey, from };
}

interface SendPasswordResetEmailParams {
  to: string;
  resetUrl: string;
}

export async function sendPasswordResetEmail({ to, resetUrl }: SendPasswordResetEmailParams): Promise<void> {
  const { apiKey, from } = getConfig();
  if (!apiKey) return;

  await fetchWithTimeout(RESEND_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from,
      to,
      subject: "JobTRIX – Passwort zurücksetzen",
      html: `<p>Klicke auf den folgenden Link, um dein Passwort zurückzusetzen:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>Der Link ist 1 Stunde gültig.</p>`,
    }),
  });
}

interface SendApplicationEmailParams {
  to: string;
  replyTo: string;
  subject: string;
  text: string;
  coverLetterBase64: string;
  cvBase64: string;
  applicantName?: string;
}

function buildFilename(prefix: string, name?: string): string {
  if (!name) return `${prefix}.pdf`;
  const trimmed = name.trim();
  if (!trimmed) return `${prefix}.pdf`;
  const parts = trimmed.split(/\s+/).map((p) => p.replace(/[^a-zA-ZäöüÄÖÜß-]/g, "")).filter(Boolean);
  if (parts.length === 0) return `${prefix}.pdf`;
  if (parts.length === 1) return `${prefix}_${parts[0]}.pdf`;
  const nachname = parts[parts.length - 1];
  const vorname = parts.slice(0, -1).join("_");
  return `${prefix}_${nachname}_${vorname}.pdf`;
}

export async function sendApplicationEmail({ to, replyTo, subject, text, coverLetterBase64, cvBase64, applicantName }: SendApplicationEmailParams): Promise<boolean> {
  const { apiKey, from } = getConfig();
  if (!apiKey) return false;

  const fromEmail = from.replace(/.*<(.+)>/, "$1").replace(/[<>]/g, "");
  const senderFrom = applicantName
    ? `"${applicantName.replace(/[<>,;\r\n"]/g, "").trim()} via JobTRIX" <${fromEmail}>`
    : from;

  const res = await fetchWithTimeout(RESEND_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from: senderFrom,
      to,
      reply_to: applicantName ? `"${applicantName.replace(/[<>,;\r\n"]/g, "").trim()}" <${replyTo}>` : replyTo,
      subject,
      text,
      attachments: [
        { filename: buildFilename("Anschreiben", applicantName), content: coverLetterBase64 },
        { filename: buildFilename("Lebenslauf", applicantName), content: cvBase64 },
      ],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error("[Resend] Fehler:", res.status, body);
  }

  return res.ok;
}
