import { validateProfile, ProfileData } from "@/lib/profile-storage";

const valid: ProfileData = {
  name: "Max Mustermann",
  address: "",
  email: "",
  phone: "",
  birthdate: "",
  photo: null,
  education: [{ id: "1", institution: "TU Berlin", degree: "B.Sc.", year: "2015" }],
  experience: [],
  qualifications: [],
  interests: [],
};

describe("validateProfile", () => {
  it("gibt keine Fehler bei gültigem Profil zurück", () => {
    expect(validateProfile(valid)).toEqual({});
  });

  it("meldet Fehler wenn Name leer ist", () => {
    const errors = validateProfile({ ...valid, name: "" });
    expect(errors.name).toBeDefined();
  });

  it("meldet Fehler wenn Name nur Leerzeichen enthält", () => {
    const errors = validateProfile({ ...valid, name: "   " });
    expect(errors.name).toBeDefined();
  });

  it("akzeptiert leere Ausbildungseinträge", () => {
    const errors = validateProfile({ ...valid, education: [] });
    expect(errors.education).toBeUndefined();
  });
});
