import { extractEmail, buildMailtoUrl } from "@/lib/email-utils";

describe("extractEmail", () => {
  it("extracts a simple email from text", () => {
    expect(extractEmail("Kontakt: info@firma.de")).toBe("info@firma.de");
  });

  it("extracts email with subdomain", () => {
    expect(extractEmail("Senden an bewerbung@hr.example.com")).toBe("bewerbung@hr.example.com");
  });

  it("extracts email surrounded by other text", () => {
    expect(extractEmail("Bitte senden Sie Ihre Bewerbung an jobs@acme.de bis zum 01.01.")).toBe("jobs@acme.de");
  });

  it("returns first email if multiple present", () => {
    expect(extractEmail("info@firma.de oder alt@firma.de")).toBe("info@firma.de");
  });

  it("returns null when no email found", () => {
    expect(extractEmail("Keine E-Mail hier")).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(extractEmail("")).toBeNull();
  });

  it("extracts email with plus sign", () => {
    expect(extractEmail("Mail: bewerbung+jobs@firma.de")).toBe("bewerbung+jobs@firma.de");
  });
});

describe("buildMailtoUrl", () => {
  it("generates a valid mailto URL with subject and body", () => {
    const url = buildMailtoUrl("test@firma.de", "Bewerbung", "Sehr geehrte Damen und Herren");
    expect(url).toBe("mailto:test@firma.de?subject=Bewerbung&body=Sehr%20geehrte%20Damen%20und%20Herren");
  });

  it("encodes special characters correctly", () => {
    const url = buildMailtoUrl("test@firma.de", "Bewerbung als Entwickler – Max", "Hallo & Grüße");
    expect(url).toContain("mailto:test@firma.de");
    expect(url).toContain("subject=");
    expect(url).toContain("body=");
    expect(decodeURIComponent(url.split("subject=")[1].split("&")[0])).toBe("Bewerbung als Entwickler – Max");
    expect(decodeURIComponent(url.split("body=")[1])).toBe("Hallo & Grüße");
  });

  it("handles empty body", () => {
    const url = buildMailtoUrl("test@firma.de", "Betreff", "");
    expect(url).toBe("mailto:test@firma.de?subject=Betreff&body=");
  });
});
