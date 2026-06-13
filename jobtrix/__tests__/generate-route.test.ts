import { buildPrompt } from "@/lib/build-prompt";

const baseRequest = {
  jobPosting: "Wir suchen einen Entwickler",
  profile: {
    name: "Max Mustermann",
    address: "Musterstraße 1",
    birthdate: "1990-01-01",
    photo: null,
    education: [
      { id: "1", institution: "TU Berlin", degree: "B.Sc.", year: "2015" },
      { id: "2", institution: "HTW Berlin", degree: "M.Sc.", year: "2018" },
    ],
    experience: [],
    qualifications: ["TypeScript", "React"],
    interests: [],
    email: "",
    phone: "",
  },
};

describe("buildPrompt – cvStyle", () => {
  it("enthält antichronologischen Hinweis wenn cvStyle american", () => {
    const prompt = buildPrompt({ ...baseRequest, cvStyle: "american" });
    expect(prompt).toContain("antichronologisch");
  });

  it("enthält keinen antichronologischen Hinweis wenn cvStyle classic", () => {
    const prompt = buildPrompt({ ...baseRequest, cvStyle: "classic" });
    expect(prompt).not.toContain("antichronologisch");
  });

  it("verhält sich wie classic wenn cvStyle fehlt", () => {
    const prompt = buildPrompt({ ...baseRequest });
    expect(prompt).not.toContain("antichronologisch");
  });
});

describe("buildPrompt – Berufserfahrung", () => {
  it("enthält Berufserfahrungsdaten aus dem Profil im generierten Prompt", () => {
    const prompt = buildPrompt({
      ...baseRequest,
      profile: {
        ...baseRequest.profile,
        experience: [
          {
            id: "1",
            company: "Acme GmbH",
            position: "Entwickler",
            period: "01/2020 - 12/2022",
            tasks: "Backend-Entwicklung",
          },
        ],
      },
    });
    expect(prompt).toContain("Berufserfahrung:");
    expect(prompt).toContain("Acme GmbH");
    expect(prompt).toContain("Entwickler");
    expect(prompt).toContain("01/2020 - 12/2022");
    expect(prompt).toContain("Backend-Entwicklung");
  });
});
