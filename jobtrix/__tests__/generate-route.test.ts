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
