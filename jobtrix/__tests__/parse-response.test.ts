import { parseResponse } from "@/app/api/generate/parse-response";

describe("parseResponse", () => {
  it("teilt eine Antwort mit vier Sektionen korrekt auf", () => {
    const text = `BETREFF: Bewerbung als Entwickler – Max Mustermann

ANSCHREIBEN: Sehr geehrte Damen und Herren,

hiermit bewerbe ich mich bei Ihnen.

Mit freundlichen Grüßen
Max Mustermann

LEBENSLAUF: Max Mustermann
Musterstraße 1

Ausbildung
B.Sc. Informatik – TU Berlin (2015)

E-MAIL: Sehr geehrte Damen und Herren,

anbei erhalten Sie meine Bewerbung als Entwickler. Im Anhang finden Sie mein Anschreiben und meinen Lebenslauf.

Mit freundlichen Grüßen
Max Mustermann`;

    const result = parseResponse(text);

    expect(result.emailSubject).toBe("Bewerbung als Entwickler – Max Mustermann");
    expect(result.coverLetter).toContain("hiermit bewerbe ich mich bei Ihnen");
    expect(result.cv).toContain("B.Sc. Informatik");
    expect(result.emailBody).toContain("anbei erhalten Sie meine Bewerbung");
    expect(result.emailBody).not.toBe(result.coverLetter);
  });

  it("gibt leeren emailBody zurück wenn E-MAIL-Sektion fehlt", () => {
    const text = `BETREFF: Bewerbung als Entwickler

ANSCHREIBEN: Mein Anschreiben.

LEBENSLAUF: Mein Lebenslauf.`;

    const result = parseResponse(text);

    expect(result.emailSubject).toBe("Bewerbung als Entwickler");
    expect(result.coverLetter).toBe("Mein Anschreiben.");
    expect(result.cv).toBe("Mein Lebenslauf.");
    expect(result.emailBody).toBe("");
  });
});
