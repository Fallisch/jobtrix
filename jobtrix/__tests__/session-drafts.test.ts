import { clearSessionDrafts } from "@/lib/session-drafts";

describe("clearSessionDrafts", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("entfernt den Profil-Entwurf", () => {
    sessionStorage.setItem("profile-draft", JSON.stringify({ name: "Test Account" }));
    clearSessionDrafts();
    expect(sessionStorage.getItem("profile-draft")).toBeNull();
  });

  it("entfernt alle Generate-Entwürfe (Stellenanzeige, Ergebnis, Anschreiben, Lebenslauf)", () => {
    sessionStorage.setItem("jt_jobPosting", "Stellenanzeige Text");
    sessionStorage.setItem("jt_result", JSON.stringify({ coverLetter: "x", cv: "y" }));
    sessionStorage.setItem("jt_coverLetter", "Anschreiben Text");
    sessionStorage.setItem("jt_cv", "Lebenslauf Text");

    clearSessionDrafts();

    expect(sessionStorage.getItem("jt_jobPosting")).toBeNull();
    expect(sessionStorage.getItem("jt_result")).toBeNull();
    expect(sessionStorage.getItem("jt_coverLetter")).toBeNull();
    expect(sessionStorage.getItem("jt_cv")).toBeNull();
  });

  it("wirft keinen Fehler, wenn keine Entwürfe vorhanden sind", () => {
    expect(() => clearSessionDrafts()).not.toThrow();
  });

  it("lässt andere, nicht App-bezogene sessionStorage-Keys unangetastet", () => {
    sessionStorage.setItem("unrelated-key", "bleibt");
    clearSessionDrafts();
    expect(sessionStorage.getItem("unrelated-key")).toBe("bleibt");
  });
});
