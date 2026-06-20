import { sendPasswordResetEmail } from "@/lib/email";

describe("sendPasswordResetEmail", () => {
  const originalApiKey = process.env.RESEND_API_KEY;
  const originalFrom = process.env.RESEND_FROM_EMAIL;

  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true });
  });

  afterEach(() => {
    process.env.RESEND_API_KEY = originalApiKey;
    process.env.RESEND_FROM_EMAIL = originalFrom;
    jest.restoreAllMocks();
  });

  it("sendet die Reset-E-Mail ueber die Resend-API mit Empfaenger und Reset-Link", async () => {
    process.env.RESEND_API_KEY = "re_test_key";
    process.env.RESEND_FROM_EMAIL = "JobTRIX <noreply@jobtrix.de>";

    await sendPasswordResetEmail({ to: "user@example.com", resetUrl: "http://localhost:3000/de/reset-password?token=abc" });

    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.resend.com/emails",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ Authorization: "Bearer re_test_key" }),
      })
    );

    const body = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
    expect(body.to).toBe("user@example.com");
    expect(body.from).toBe("JobTRIX <noreply@jobtrix.de>");
    expect(body.html).toContain("http://localhost:3000/de/reset-password?token=abc");
  });

  it("sendet keine E-Mail, wenn kein RESEND_API_KEY konfiguriert ist", async () => {
    delete process.env.RESEND_API_KEY;

    await sendPasswordResetEmail({ to: "user@example.com", resetUrl: "http://localhost:3000/de/reset-password?token=abc" });

    expect(global.fetch).not.toHaveBeenCalled();
  });
});
