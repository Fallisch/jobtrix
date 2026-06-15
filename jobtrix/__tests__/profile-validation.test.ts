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

  it("meldet Fehler wenn keine Ausbildungseinträge vorhanden sind", () => {
    const errors = validateProfile({ ...valid, education: [] });
    expect(errors.education).toBeDefined();
  });

  it("meldet beide Fehler gleichzeitig", () => {
    const errors = validateProfile({ ...valid, name: "", education: [] });
    expect(errors.name).toBeDefined();
    expect(errors.education).toBeDefined();
  });
});
