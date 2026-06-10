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
