import { scoreProfile, CvScoreResult, CATEGORY_WEIGHT } from "@/lib/cv-score";
import { ProfileData } from "@/lib/profile-storage";

function emptyProfile(): ProfileData {
  return {
    name: "",
    address: "",
    email: "",
    phone: "",
    birthdate: "",
    photo: null,
    education: [],
    experience: [],
    qualifications: [],
    interests: [],
  };
}

function fullProfile(): ProfileData {
  return {
    name: "Max Mustermann",
    address: "Musterstraße 1, 12345 Berlin",
    email: "max@example.com",
    phone: "+49 170 1234567",
    birthdate: "1990-01-15",
    photo: "data:image/png;base64,abc",
    education: [
      { id: "e1", institution: "TU Berlin", degree: "B.Sc. Informatik", year: "2012" },
    ],
    experience: [
      {
        id: "x1",
        company: "Firma A",
        position: "Entwickler",
        period: "2015 – 2020",
        tasks: "Frontend-Entwicklung mit React\nBackend-APIs mit Node.js\nCode-Reviews und Mentoring",
      },
      {
        id: "x2",
        company: "Firma B",
        position: "Senior Entwickler",
        period: "2020 – heute",
        tasks: "Architektur und Systemdesign\nTeamleitung von 5 Entwicklern\nCI/CD-Pipeline aufgebaut",
      },
    ],
    qualifications: [
      { label: "TypeScript", value: 90 },
      { label: "React", value: 85 },
      { label: "Node.js", value: 80 },
    ],
    interests: [
      { label: "Open Source", value: 70 },
    ],
  };
}

describe("scoreProfile", () => {
  describe("leeres Profil", () => {
    it("ergibt einen niedrigen Gesamt-Score", () => {
      const result = scoreProfile(emptyProfile());
      expect(result.total).toBeLessThanOrEqual(20);
      expect(result.total).toBeGreaterThanOrEqual(0);
    });

    it("erzeugt Tipps für fehlende Kernfelder", () => {
      const result = scoreProfile(emptyProfile());
      const tipIds = result.tips.map((t) => t.id);
      expect(tipIds).toContain("missing-name");
      expect(tipIds).toContain("missing-contact");
      expect(tipIds).toContain("missing-photo");
      expect(tipIds).toContain("missing-experience");
      expect(tipIds).toContain("missing-education");
      expect(tipIds).toContain("missing-qualifications");
    });
  });

  describe("vollständiges Profil", () => {
    it("ergibt einen hohen Gesamt-Score", () => {
      const result = scoreProfile(fullProfile());
      expect(result.total).toBeGreaterThanOrEqual(80);
      expect(result.total).toBeLessThanOrEqual(100);
    });

    it("hat wenige oder keine Tipps", () => {
      const result = scoreProfile(fullProfile());
      expect(result.tips.length).toBeLessThanOrEqual(3);
    });
  });

  describe("Ergebnis-Struktur", () => {
    it("enthält total, categories und tips", () => {
      const result = scoreProfile(emptyProfile());
      expect(result).toHaveProperty("total");
      expect(result).toHaveProperty("categories.completeness");
      expect(result).toHaveProperty("categories.structure");
      expect(result).toHaveProperty("categories.clarity");
      expect(result).toHaveProperty("tips");
    });

    it("Score immer 0–100, Kategorien immer 0–100", () => {
      for (const profile of [emptyProfile(), fullProfile()]) {
        const result = scoreProfile(profile);
        expect(result.total).toBeGreaterThanOrEqual(0);
        expect(result.total).toBeLessThanOrEqual(100);
        expect(result.categories.completeness).toBeGreaterThanOrEqual(0);
        expect(result.categories.completeness).toBeLessThanOrEqual(100);
        expect(result.categories.structure).toBeGreaterThanOrEqual(0);
        expect(result.categories.structure).toBeLessThanOrEqual(100);
        expect(result.categories.clarity).toBeGreaterThanOrEqual(0);
        expect(result.categories.clarity).toBeLessThanOrEqual(100);
      }
    });

    it("Gewichtung als benannte Konstanten (je ⅓)", () => {
      expect(CATEGORY_WEIGHT).toBeCloseTo(1 / 3);
    });
  });

  describe("Tipps", () => {
    it("sind nach Impact absteigend sortiert", () => {
      const result = scoreProfile(emptyProfile());
      for (let i = 1; i < result.tips.length; i++) {
        expect(result.tips[i - 1].impact).toBeGreaterThanOrEqual(result.tips[i].impact);
      }
    });

    it("enthalten id und impact", () => {
      const result = scoreProfile(emptyProfile());
      for (const tip of result.tips) {
        expect(typeof tip.id).toBe("string");
        expect(typeof tip.impact).toBe("number");
      }
    });
  });

  describe("gezielte Änderungen", () => {
    it("Foto ergänzen → Score steigt", () => {
      const without = scoreProfile(emptyProfile());
      const withPhoto = scoreProfile({ ...emptyProfile(), photo: "data:image/png;base64,abc" });
      expect(withPhoto.total).toBeGreaterThan(without.total);
    });

    it("Erfahrung hinzufügen → Score steigt", () => {
      const without = scoreProfile(emptyProfile());
      const withExp = scoreProfile({
        ...emptyProfile(),
        experience: [{
          id: "x1",
          company: "Firma",
          position: "Dev",
          period: "2020 – 2023",
          tasks: "Entwicklung\nTesting\nDeployment",
        }],
      });
      expect(withExp.total).toBeGreaterThan(without.total);
    });
  });

  describe("Tipp-Impacts überschreiten nie den erreichbaren Rest (#236)", () => {
    function highScoreManyTipsProfile(): ProfileData {
      // Vollständige Kernfelder (hohe Completeness/Clarity), aber 8 Stationen
      // mit nur einer Aufgaben-Zeile → viele Struktur-Tipps. Reproduziert den
      // gemeldeten Fall: Score ~85, Summe der Tipps > 15.
      const experience = Array.from({ length: 8 }, (_, i) => ({
        id: `x${i}`,
        company: `Firma ${i}`,
        position: "Zerspanungsmechaniker",
        period: "2015 – 2020",
        tasks: "Bediente CNC-Maschinen im Schichtbetrieb",
      }));
      return {
        name: "Falk Schieck",
        address: "August-Bebel-Str. 5, 08340 Schwarzenberg",
        email: "falk@example.com",
        phone: "015234754970",
        birthdate: "1985-09-10",
        photo: "data:image/png;base64,abc",
        education: [
          { id: "e1", institution: "BSW Chemnitz", degree: "Facharbeiter", year: "2006" },
        ],
        experience,
        qualifications: [
          { label: "CNC", value: 90 },
          { label: "Linux", value: 60 },
        ],
        interests: [],
      };
    }

    it("Gesamt-Score + Summe aller Tipp-Impacts bleibt ≤ 100", () => {
      const result = scoreProfile(highScoreManyTipsProfile());
      const tipSum = result.tips.reduce((sum, t) => sum + t.impact, 0);
      expect(result.total + tipSum).toBeLessThanOrEqual(100);
    });

    it("gilt auch für das leere Profil", () => {
      const result = scoreProfile(emptyProfile());
      const tipSum = result.tips.reduce((sum, t) => sum + t.impact, 0);
      expect(result.total + tipSum).toBeLessThanOrEqual(100);
    });

    it("jeder angezeigte Tipp behält einen positiven Impact", () => {
      const result = scoreProfile(highScoreManyTipsProfile());
      for (const tip of result.tips) {
        expect(tip.impact).toBeGreaterThan(0);
      }
    });
  });

  describe("Determinismus", () => {
    it("gleiches Profil → exakt gleicher Score und Tipp-Reihenfolge", () => {
      const profile = fullProfile();
      const result1 = scoreProfile(profile);
      const result2 = scoreProfile(profile);
      expect(result1.total).toBe(result2.total);
      expect(result1.categories).toEqual(result2.categories);
      expect(result1.tips).toEqual(result2.tips);
    });
  });
});
