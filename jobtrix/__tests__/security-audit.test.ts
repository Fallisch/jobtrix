/**
 * @jest-environment node
 */
import * as fs from "fs";
import * as path from "path";

const AUDIT_PATH = path.join(__dirname, "../../docs/SECURITY-AUDIT.md");

function content(): string {
  return fs.readFileSync(AUDIT_PATH, "utf-8");
}

describe("Security-Audit-Dokument", () => {
  it("docs/SECURITY-AUDIT.md existiert", () => {
    expect(fs.existsSync(AUDIT_PATH)).toBe(true);
  });

  it("enthält geprüfte Bereiche (IDOR-Verifikation)", () => {
    expect(content()).toMatch(/IDOR|gepr[üu]ft/i);
  });

  it("enthält gefundene und umgesetzte Findings", () => {
    const c = content();
    expect(c).toMatch(/Finding|Fix|Maßnahme|umgesetzt/i);
  });

  it("enthält verbleibende Findings mit Next.js-Upgrade-Verweis", () => {
    const c = content();
    expect(c).toMatch(/Next\.js/i);
    expect(c).toMatch(/verbleib|offen|pending/i);
  });

  it("enthält ein Prüfungsdatum", () => {
    expect(content()).toMatch(/202\d-\d{2}-\d{2}/);
  });
});
