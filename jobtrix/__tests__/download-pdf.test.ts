/**
 * @jest-environment node
 */
import { buildFilename } from "@/lib/download-pdf";

describe("buildFilename", () => {
  it("erzeugt Nachname_Vorname-Schema aus vollem Namen", () => {
    expect(buildFilename("Anschreiben", "Falk Schieck")).toBe("Anschreiben_Schieck_Falk.pdf");
  });

  it("behandelt mehrteilige Vornamen korrekt", () => {
    expect(buildFilename("Lebenslauf", "Anna Maria Schmidt")).toBe("Lebenslauf_Schmidt_Anna_Maria.pdf");
  });

  it("verwendet einteiligen Namen direkt", () => {
    expect(buildFilename("Anschreiben", "Madonna")).toBe("Anschreiben_Madonna.pdf");
  });

  it("gibt nur Prefix zurück bei leerem Namen", () => {
    expect(buildFilename("Anschreiben", "")).toBe("Anschreiben.pdf");
  });

  it("gibt nur Prefix zurück bei Whitespace-only Namen", () => {
    expect(buildFilename("Lebenslauf", "   ")).toBe("Lebenslauf.pdf");
  });

  it("erlaubt deutsche Umlaute", () => {
    expect(buildFilename("Anschreiben", "Jörg Müller")).toBe("Anschreiben_Müller_Jörg.pdf");
  });

  it("filtert Sonderzeichen aber behält Umlaute", () => {
    expect(buildFilename("Anschreiben", "Dr. Hans-Peter O'Brien")).toBe("Anschreiben_OBrien_Dr_Hans-Peter.pdf");
  });
});
