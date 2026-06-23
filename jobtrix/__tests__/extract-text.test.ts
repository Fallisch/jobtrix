/**
 * @jest-environment node
 */
import { extractReadableText, hasEnoughText } from "@/lib/extract-text";

describe("extractReadableText", () => {
  it("entfernt script-, style- und noscript-Inhalte", () => {
    const html =
      "<html><head><style>.a{color:red}</style></head><body>" +
      "<script>trackUser()</script><p>Wir suchen einen Entwickler</p>" +
      "<noscript>Bitte JS aktivieren</noscript></body></html>";
    const text = extractReadableText(html);
    expect(text).toContain("Wir suchen einen Entwickler");
    expect(text).not.toContain("trackUser");
    expect(text).not.toContain("color:red");
    expect(text).not.toContain("Bitte JS aktivieren");
  });

  it("entfernt alle HTML-Tags und behält den lesbaren Text", () => {
    const text = extractReadableText("<div><h1>Stelle</h1><p>Aufgaben: <b>viele</b></p></div>");
    expect(text).toBe("Stelle Aufgaben: viele");
  });

  it("dekodiert HTML-Entities inkl. Umlaute", () => {
    const text = extractReadableText("<p>B&uuml;ro &amp; Stra&szlig;e &nbsp;jetzt</p>");
    expect(text).toContain("Büro & Straße");
  });

  it("dekodiert numerische Entities", () => {
    const text = extractReadableText("<p>Preis 5&#8364; &#x2013; gut</p>");
    expect(text).toContain("5€");
    expect(text).toContain("–");
  });

  it("kollabiert Whitespace und trimmt", () => {
    expect(extractReadableText("<p>  viel\n\n   Platz  </p>")).toBe("viel Platz");
  });
});

describe("hasEnoughText", () => {
  it("ist false bei zu wenig Text", () => {
    expect(hasEnoughText("zu kurz")).toBe(false);
    expect(hasEnoughText("")).toBe(false);
  });

  it("ist true ab genügend Text", () => {
    expect(hasEnoughText("a".repeat(200))).toBe(true);
  });
});
