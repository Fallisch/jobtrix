/**
 * @jest-environment node
 */
import deMessages from "../messages/de.json";
import enMessages from "../messages/en.json";

const deHosting = (deMessages as Record<string, Record<string, string>>).datenschutz.hostingBody;
const enHosting = (enMessages as Record<string, Record<string, string>>).datenschutz.hostingBody;

describe("Datenschutzerklärung – Hosting-Abschnitt", () => {
  describe("DE (messages/de.json)", () => {
    it("enthält keinen Platzhaltertext mehr", () => {
      expect(deHosting).not.toContain("[Platzhalter");
    });

    it("nennt Render als App-Hosting-Anbieter", () => {
      expect(deHosting).toContain("Render");
    });

    it("nennt Supabase als Datenbank-Anbieter", () => {
      expect(deHosting).toContain("Supabase");
    });

    it("nennt Cloudflare als DNS/CDN-Anbieter", () => {
      expect(deHosting).toContain("Cloudflare");
    });

    it("enthält EU-Regionsangabe", () => {
      expect(deHosting).toMatch(/EU|Frankfurt|Europa/i);
    });
  });

  describe("EN (messages/en.json)", () => {
    it("enthält keinen Platzhaltertext mehr", () => {
      expect(enHosting).not.toContain("[Placeholder");
    });

    it("nennt Render als App-Hosting-Anbieter", () => {
      expect(enHosting).toContain("Render");
    });

    it("nennt Supabase als Datenbank-Anbieter", () => {
      expect(enHosting).toContain("Supabase");
    });

    it("nennt Cloudflare als DNS/CDN-Anbieter", () => {
      expect(enHosting).toContain("Cloudflare");
    });

    it("enthält EU-Regionsangabe", () => {
      expect(enHosting).toMatch(/EU|Frankfurt|Europe/i);
    });
  });
});
