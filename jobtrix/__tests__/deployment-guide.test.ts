/**
 * @jest-environment node
 */
import * as fs from "fs";
import * as path from "path";

const GUIDE_PATH = path.join(__dirname, "../../docs/DEPLOYMENT.md");
const MIGRATIONS_PATH = path.join(__dirname, "../prisma/migrations");

function content(): string {
  return fs.readFileSync(GUIDE_PATH, "utf-8");
}

describe("Deployment-Guide", () => {
  it("docs/DEPLOYMENT.md existiert", () => {
    expect(fs.existsSync(GUIDE_PATH)).toBe(true);
  });

  it("enthält Umgebungsvariablen-Liste", () => {
    const c = content();
    expect(c).toMatch(/DATABASE_URL/);
    expect(c).toMatch(/NEXTAUTH_SECRET/);
    expect(c).toMatch(/STRIPE_/);
  });

  it("enthält Stripe-Webhook-Anleitung", () => {
    expect(content()).toMatch(/webhook/i);
    expect(content()).toMatch(/jobtrix\.de\/api\/webhooks\/stripe/);
  });

  it("enthält AVV-Hinweis", () => {
    expect(content()).toMatch(/AVV|Auftragsverarbeitung/i);
  });

  it("enthält Schritt-für-Schritt-Checkliste für Render, Supabase und Cloudflare", () => {
    const c = content();
    expect(c).toMatch(/Render/i);
    expect(c).toMatch(/Supabase/i);
    expect(c).toMatch(/Cloudflare/i);
  });

  it("enthält prisma migrate deploy-Anweisung", () => {
    expect(content()).toMatch(/prisma migrate deploy/);
  });

  it("alle 12 Prisma-Migrationen sind im Repository vorhanden", () => {
    const migrations = fs
      .readdirSync(MIGRATIONS_PATH)
      .filter((d) => !d.endsWith(".toml"));
    expect(migrations.length).toBe(12);
  });
});
