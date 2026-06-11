import { sendPasswordResetEmail } from "@/lib/email";

describe("sendPasswordResetEmail", () => {
  const originalApiKey = process.env.BREVO_API_KEY;
  const originalSender = process.env.BREVO_SENDER_EMAIL;

  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true });
  });

  afterEach(() => {
    process.env.BREVO_API_KEY = originalApiKey;
    process.env.BREVO_SENDER_EMAIL = originalSender;
    jest.restoreAllMocks();
  });

  it("sendet die Reset-E-Mail ueber die Brevo-API mit Empfaenger und Reset-Link", async () => {
    process.env.BREVO_API_KEY = "test-brevo-key";
    process.env.BREVO_SENDER_EMAIL = "noreply@jobtrix.app";

    await sendPasswordResetEmail({ to: "user@example.com", resetUrl: "http://localhost:3000/de/reset-password?token=abc" });

    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.brevo.com/v3/smtp/email",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ "api-key": "test-brevo-key" }),
      })
    );

    const body = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
    expect(body.to).toEqual([{ email: "user@example.com" }]);
    expect(body.sender.email).toBe("noreply@jobtrix.app");
    expect(body.htmlContent).toContain("http://localhost:3000/de/reset-password?token=abc");
  });

  it("sendet keine E-Mail, wenn kein BREVO_API_KEY konfiguriert ist", async () => {
    delete process.env.BREVO_API_KEY;

    await sendPasswordResetEmail({ to: "user@example.com", resetUrl: "http://localhost:3000/de/reset-password?token=abc" });

    expect(global.fetch).not.toHaveBeenCalled();
  });
});
