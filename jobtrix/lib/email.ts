interface SendPasswordResetEmailParams {
  to: string;
  resetUrl: string;
}

export async function sendPasswordResetEmail({ to, resetUrl }: SendPasswordResetEmailParams): Promise<void> {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) return;

  await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": apiKey,
    },
    body: JSON.stringify({
      sender: { email: process.env.BREVO_SENDER_EMAIL ?? "noreply@jobtrix.app", name: "JobTRIX" },
      to: [{ email: to }],
      subject: "JobTRIX – Passwort zurücksetzen",
      htmlContent: `<p>Klicke auf den folgenden Link, um dein Passwort zurückzusetzen:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>Der Link ist 1 Stunde gültig.</p>`,
    }),
  });
}
