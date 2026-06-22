import { buildPrompt } from "@/lib/build-prompt";
import { ProfileData } from "@/lib/profile-storage";

const baseProfile: ProfileData = {
  name: "Max Mustermann",
  address: "Musterstraße 1",
  email: "",
  phone: "",
  birthdate: "1990-01-01",
  photo: null,
  education: [{ id: "1", institution: "TU Berlin", degree: "B.Sc.", year: "2015" }],
  experience: [],
  qualifications: [{ label: "TypeScript", value: 80 }, { label: "React", value: 60 }],
  interests: [{ label: "Reisen", value: 40 }],
};

describe("buildPrompt", () => {
  it("enthält Anweisung, typische KI-Floskeln zu vermeiden", () => {
    const prompt = buildPrompt({ jobPosting: "Stelle als Entwickler", profile: baseProfile });
    expect(prompt).toMatch(/floskeln|phrasen|formulierungen.*vermeid|vermeide.*floskeln/i);
    expect(prompt).toMatch(/freue mich sehr|leidenschaftlich/i);
  });

  it("enthält Anweisung für natürliche, variierte Satzstruktur", () => {
    const prompt = buildPrompt({ jobPosting: "Stelle als Entwickler", profile: baseProfile });
    expect(prompt).toMatch(/satzl.nge|satzstruktur|kurze.*s.tze|lange.*s.tze|variier/i);
  });

  it("enthält Anweisung, austauschbare Schlussfloskeln im Anschreiben zu vermeiden", () => {
    const prompt = buildPrompt({ jobPosting: "Stelle als Entwickler", profile: baseProfile });
    expect(prompt).toMatch(/schlussfloskel|abschlussfloskel|schlusss.tze?.*vermeid|vermeid.*schluss/i);
    expect(prompt).toMatch(/freue mich auf ein pers.nliches gespr.ch|einladung.*vorstellungsgespr.ch/i);
  });

  it("enthält AIDA-basierte Strukturvorgaben für das Anschreiben (Einstieg, Hauptteil, Schluss)", () => {
    const prompt = buildPrompt({ jobPosting: "Stelle als Entwickler", profile: baseProfile });
    expect(prompt).toMatch(/aida/i);
    expect(prompt).toMatch(/mit gro.em interesse.*stellenanzeige gelesen/i);
    expect(prompt).toMatch(/mehrwert/i);
  });

  it("enthält Anweisung, Sätze nicht wiederholt mit „Ich“ zu beginnen", () => {
    const prompt = buildPrompt({ jobPosting: "Stelle als Entwickler", profile: baseProfile });
    expect(prompt).toMatch(/nicht mehrere s.tze.*ich|ich.*satzanf.nge|satzanf.nge.*ich/i);
  });

  it("enthält Qualifikations-Labels im Prompt (nicht [object Object])", () => {
    const prompt = buildPrompt({ jobPosting: "Stelle als Entwickler", profile: baseProfile });
    expect(prompt).toContain("TypeScript");
    expect(prompt).toContain("React");
    expect(prompt).not.toContain("[object Object]");
  });

  it("enthält Interessen-Labels im Prompt", () => {
    const prompt = buildPrompt({ jobPosting: "Stelle als Entwickler", profile: baseProfile });
    expect(prompt).toContain("Reisen");
    expect(prompt).not.toContain("[object Object]");
  });
});

describe("buildPrompt – Berufserfahrung", () => {
  const profileWithExperience: ProfileData = {
    ...baseProfile,
    experience: [
      {
        id: "1",
        company: "Acme GmbH",
        position: "Entwickler",
        period: "01/2020 - 12/2022",
        tasks: "Backend-Entwicklung",
      },
    ],
  };

  it("enthält einen Berufserfahrung-Abschnitt mit Firma, Position, Zeitraum und Aufgaben wenn Einträge vorhanden sind", () => {
    const prompt = buildPrompt({ jobPosting: "Stelle als Entwickler", profile: profileWithExperience });
    expect(prompt).toContain("Berufserfahrung:");
    expect(prompt).toContain("Acme GmbH");
    expect(prompt).toContain("Entwickler");
    expect(prompt).toContain("01/2020 - 12/2022");
    expect(prompt).toContain("Backend-Entwicklung");
  });

  it("erzeugt keinen Berufserfahrung-Abschnitt wenn keine Einträge vorhanden sind", () => {
    const prompt = buildPrompt({ jobPosting: "Stelle als Entwickler", profile: baseProfile });
    expect(prompt).not.toContain("Berufserfahrung:");
  });
});

describe("buildPrompt – Sektions-Trennung und HINWEIS-Verbot", () => {
  it("enthält explizite Anweisung, dass der Lebenslauf alle Profildaten enthalten muss", () => {
    const prompt = buildPrompt({ jobPosting: "Stelle als Entwickler", profile: baseProfile });
    expect(prompt).toMatch(/lebenslauf.*muss.*profildaten|lebenslauf.*enth.lt.*ausbildung.*berufserfahrung.*qualifikation/i);
  });

  it("enthält explizite Anweisung, dass der E-Mail-Body nur kurzen Text enthalten darf", () => {
    const prompt = buildPrompt({ jobPosting: "Stelle als Entwickler", profile: baseProfile });
    expect(prompt).toMatch(/e-mail.*nur.*kurz|e-mail.*keine.*profildaten|e-mail.*text.*keine.*lebenslauf/i);
  });

  it("verbietet HINWEIS-Blöcke in generierten Texten", () => {
    const prompt = buildPrompt({ jobPosting: "Stelle als Entwickler", profile: baseProfile });
    expect(prompt).toMatch(/hinweis.*verbot|keine.*hinweis|niemals.*hinweis|verboten.*hinweis/i);
  });
});

describe("buildPrompt – E-Mail-Sektion", () => {
  it("enthält E-MAIL als vierte Ausgabesektion im Antwortformat", () => {
    const prompt = buildPrompt({ jobPosting: "Stelle als Entwickler", profile: baseProfile });
    expect(prompt).toMatch(/BETREFF[\s\S]*ANSCHREIBEN[\s\S]*LEBENSLAUF[\s\S]*E-MAIL/);
  });

  it("enthält Anweisungen für einen kurzen E-Mail-Text mit Anrede, Stellenbezug, Anhang-Verweis und Grußformel", () => {
    const prompt = buildPrompt({ jobPosting: "Stelle als Entwickler", profile: baseProfile });
    expect(prompt).toMatch(/anrede/i);
    expect(prompt).toMatch(/anh.ng|anlage|beigef.gt/i);
    expect(prompt).toMatch(/gru.formel|gru./i);
    expect(prompt).toMatch(/3.{0,5}5 s.tze|kurz/i);
  });

  it("enthält Arbeitsform-Hinweis im Prompt wenn workMode ausgewählt ist", () => {
    const prompt = buildPrompt({ jobPosting: "Stelle als Entwickler", profile: baseProfile, workMode: "remote" });
    expect(prompt).toMatch(/remote/i);
  });

  it("enthält keinen Arbeitsform-Hinweis wenn workMode nicht gesetzt ist", () => {
    const prompt = buildPrompt({ jobPosting: "Stelle als Entwickler", profile: baseProfile });
    expect(prompt).not.toMatch(/arbeitsform|bevorzugte.*remote|bevorzugte.*hybrid/i);
  });

  it("enthält bei Initiativbewerbung Unternehmensbezug statt Stellenbezug in der E-Mail-Sektion", () => {
    const prompt = buildPrompt({
      jobPosting: "",
      profile: baseProfile,
      isInitiativbewerbung: true,
      targetCompany: "Acme GmbH",
    });
    expect(prompt).toMatch(/initiativ|unternehmen/i);
    expect(prompt).toMatch(/E-MAIL/);
  });
});
