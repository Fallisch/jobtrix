import de from "@/messages/de.json";
import en from "@/messages/en.json";

describe("Lebenslauf-Stil i18n-Labels (Issue #66)", () => {
  it("zeigt 'Reihenfolge Einträge' als Label in DE", () => {
    expect(de.generate.cvStyleLabel).toBe("Reihenfolge Einträge");
  });

  it("zeigt 'Entry order' als Label in EN", () => {
    expect(en.generate.cvStyleLabel).toBe("Entry order");
  });

  it("zeigt 'Ältestes zuerst' für classic-Option in DE", () => {
    expect(de.generate.cvStyleClassic).toBe("Ältestes zuerst");
  });

  it("zeigt 'Oldest first' für classic-Option in EN", () => {
    expect(en.generate.cvStyleClassic).toBe("Oldest first");
  });

  it("zeigt 'Neuestes zuerst (Empfohlen)' für american-Option in DE", () => {
    expect(de.generate.cvStyleAmerican).toBe("Neuestes zuerst (Empfohlen)");
  });

  it("zeigt 'Newest first (Recommended)' für american-Option in EN", () => {
    expect(en.generate.cvStyleAmerican).toBe("Newest first (Recommended)");
  });
});
