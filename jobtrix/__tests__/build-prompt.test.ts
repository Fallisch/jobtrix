import { buildPrompt, buildHumanizePrompt } from "@/lib/build-prompt";
import { ProfileData } from "@/lib/profile-storage";

const baseProfile: ProfileData = {
  name: "Max Mustermann",
  address: "Musterstraße 1",
  email: "",
  phone: "",
  birthdate: "1990-01-01",
  photo: null,
  education: [{ id: "1", institution: "TU Berlin", degree: "B.Sc.", year: "2015" }],
  qualifications: [{ label: "TypeScript", value: 80 }, { label: "React", value: 60 }],
  interests: [{ label: "Reisen", value: 40 }],
};

describe("buildPrompt", () => {
  it("enthält Verbot der häufigsten KI-Floskeln mit konkreten Beispielen", () => {
    const prompt = buildPrompt({ jobPosting: "Stelle als Entwickler", profile: baseProfile });
    expect(prompt).toMatch(/freue mich sehr/i);
    expect(prompt).toMatch(/leidenschaftlich/i);
    expect(prompt).toMatch(/motiviert/i);
    expect(prompt).toMatch(/niemals verwenden|verboten/i);
  });

  it("enthält Anweisung zur Satzlängen-Variation mit explizitem Hinweis auf kurze und lange Sätze", () => {
    const prompt = buildPrompt({ jobPosting: "Stelle als Entwickler", profile: baseProfile });
    expect(prompt).toMatch(/kurz|kurze/i);
    expect(prompt).toMatch(/l.nger|lang/i);
    expect(prompt).toMatch(/variier/i);
  });

  it("enthält Anweisung, Sätze nicht zweimal mit 'Ich' zu beginnen", () => {
    const prompt = buildPrompt({ jobPosting: "Stelle als Entwickler", profile: baseProfile });
    expect(prompt).toMatch(/nicht.*zweimal.*ich|nie.*zweimal.*ich|hintereinander.*ich/i);
  });

  it("enthält Anweisung zu konkreten statt abstrakten Formulierungen", () => {
    const prompt = buildPrompt({ jobPosting: "Stelle als Entwickler", profile: baseProfile });
    expect(prompt).toMatch(/konkret|abstrakt/i);
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

describe("buildHumanizePrompt", () => {
  const sampleCoverLetter = "Sehr geehrte Damen und Herren, ich freue mich sehr über die Stelle.";
  const sampleCv = "Max Mustermann – Lebenslauf";

  it("enthält den übergebenen Anschreiben-Text", () => {
    const prompt = buildHumanizePrompt(sampleCoverLetter, sampleCv);
    expect(prompt).toContain(sampleCoverLetter);
  });

  it("enthält den übergebenen Lebenslauf-Text", () => {
    const prompt = buildHumanizePrompt(sampleCoverLetter, sampleCv);
    expect(prompt).toContain(sampleCv);
  });

  it("enthält Anweisung zur starken Satzlängen-Variation", () => {
    const prompt = buildHumanizePrompt(sampleCoverLetter, sampleCv);
    expect(prompt).toMatch(/satzl.nge|extrem variier|kurze.*s.tze/i);
  });

  it("enthält Anweisung gegen Ich-Wiederholung am Satzanfang", () => {
    const prompt = buildHumanizePrompt(sampleCoverLetter, sampleCv);
    expect(prompt).toMatch(/nie.*zweimal.*ich|zweimal.*ich|hintereinander.*ich/i);
  });

  it("enthält Anweisung, Fakten unverändert zu lassen", () => {
    const prompt = buildHumanizePrompt(sampleCoverLetter, sampleCv);
    expect(prompt).toMatch(/fakten|behalte.*bei|.nder.*nur.*stil/i);
  });

  it("gibt das Ausgabeformat ANSCHREIBEN: / LEBENSLAUF: vor", () => {
    const prompt = buildHumanizePrompt(sampleCoverLetter, sampleCv);
    expect(prompt).toContain("ANSCHREIBEN:");
    expect(prompt).toContain("LEBENSLAUF:");
  });
});
