import { saveProfile, loadProfile, ProfileData } from "@/lib/profile-storage";

const baseProfile: ProfileData = {
  name: "Max Mustermann",
  address: "Musterstraße 1, 12345 Berlin",
  birthdate: "1990-01-15",
  photo: null,
  education: [{ id: "1", institution: "TU Berlin", degree: "B.Sc.", year: "2015" }],
  qualifications: ["TypeScript", "React"],
  interests: ["Reisen"],
};

beforeEach(() => localStorage.clear());

describe("saveProfile / loadProfile", () => {
  it("gibt null zurück wenn kein Profil gespeichert ist", () => {
    expect(loadProfile()).toBeNull();
  });

  it("speichert ein Profil und lädt es wieder korrekt", () => {
    saveProfile(baseProfile);
    expect(loadProfile()).toEqual(baseProfile);
  });

  it("überschreibt ein vorhandenes Profil", () => {
    saveProfile(baseProfile);
    const updated = { ...baseProfile, name: "Erika Musterfrau" };
    saveProfile(updated);
    expect(loadProfile()?.name).toBe("Erika Musterfrau");
  });

  it("speichert und lädt Ausbildungseinträge korrekt", () => {
    const multiEdu = {
      ...baseProfile,
      education: [
        { id: "1", institution: "TU Berlin", degree: "B.Sc.", year: "2015" },
        { id: "2", institution: "HU Berlin", degree: "M.Sc.", year: "2018" },
      ],
    };
    saveProfile(multiEdu);
    expect(loadProfile()?.education).toHaveLength(2);
  });
});
