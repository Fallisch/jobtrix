import { saveProfile, loadProfile, ProfileData } from "@/lib/profile-storage";

const baseProfile: ProfileData = {
  name: "Max Mustermann",
  address: "Musterstraße 1, 12345 Berlin",
  email: "max@example.de",
  phone: "0151 99887766",
  birthdate: "1990-01-15",
  photo: null,
  education: [{ id: "1", institution: "TU Berlin", degree: "B.Sc.", year: "2015" }],
  qualifications: [{ label: "TypeScript", value: 80 }, { label: "React", value: 60 }],
  interests: [{ label: "Reisen", value: 60 }],
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

describe("loadProfile / Legacy-Migration", () => {
  it("migriert ein Legacy-Profil mit `strengths` zu `interests`", () => {
    const legacy = {
      name: "Alte Hasin",
      address: "Altstraße 1, 10115 Berlin",
      birthdate: "1985-05-05",
      photo: null,
      education: [{ id: "1", institution: "FU Berlin", degree: "B.A.", year: "2008" }],
      qualifications: ["Excel"],
      strengths: ["Teamfähigkeit", "Kreativität"],
    };
    localStorage.setItem("jobtrix_profile", JSON.stringify(legacy));

    expect(loadProfile()?.interests).toEqual([
      { label: "Teamfähigkeit", value: 60 },
      { label: "Kreativität", value: 60 },
    ]);
  });

  it("lädt ein Profil ganz ohne interests-/strengths-Feld mit leerer Interessen-Liste", () => {
    const ancient = {
      name: "Uralte Hasin",
      address: "Uraltweg 1, 10999 Berlin",
      birthdate: "1970-01-01",
      photo: null,
      education: [{ id: "1", institution: "TU Berlin", degree: "Diplom", year: "1995" }],
      qualifications: ["Word"],
    };
    localStorage.setItem("jobtrix_profile", JSON.stringify(ancient));

    expect(loadProfile()?.interests).toEqual([]);
  });
});

describe("loadProfile / Skill-Werte", () => {
  it("mappt alte String-Qualifikationen auf {label, value: 60}", () => {
    localStorage.setItem(
      "jobtrix_profile",
      JSON.stringify({ name: "Test", qualifications: ["Python", "SQL"], interests: [] })
    );
    const profile = loadProfile();
    expect(profile?.qualifications).toEqual([
      { label: "Python", value: 60 },
      { label: "SQL", value: 60 },
    ]);
  });

  it("mappt alte String-Interessen auf {label, value: 60}", () => {
    localStorage.setItem(
      "jobtrix_profile",
      JSON.stringify({ name: "Test", qualifications: [], interests: ["Coding"] })
    );
    expect(loadProfile()?.interests).toEqual([{ label: "Coding", value: 60 }]);
  });

  it("behält Objekt-Format mit individuellem value", () => {
    localStorage.setItem(
      "jobtrix_profile",
      JSON.stringify({
        name: "Test",
        qualifications: [{ label: "Python", value: 80 }],
        interests: [{ label: "Lesen", value: 40 }],
      })
    );
    const profile = loadProfile();
    expect(profile?.qualifications).toEqual([{ label: "Python", value: 80 }]);
    expect(profile?.interests).toEqual([{ label: "Lesen", value: 40 }]);
  });
});
