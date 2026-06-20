const RESEND_API = "https://api.resend.com/emails";

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

  await fetch(RESEND_API, {
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
}

export async function sendApplicationEmail({ to, replyTo, subject, text, coverLetterBase64, cvBase64 }: SendApplicationEmailParams): Promise<boolean> {
  const { apiKey, from } = getConfig();
  if (!apiKey) return false;

  const res = await fetch(RESEND_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from,
      to,
      reply_to: replyTo,
      subject,
      text,
      attachments: [
        { filename: "anschreiben.pdf", content: coverLetterBase64 },
        { filename: "lebenslauf.pdf", content: cvBase64 },
      ],
    }),
  });

  return res.ok;
}
