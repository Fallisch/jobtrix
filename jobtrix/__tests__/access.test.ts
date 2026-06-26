import { checkAccess } from "@/lib/access";

const now = new Date("2026-06-11T12:00:00Z");
const future = new Date("2026-07-11T12:00:00Z");
const past = new Date("2026-05-11T12:00:00Z");

describe("checkAccess", () => {
  it("erlaubt die Generierung wenn noch keine Generierung verbraucht wurde (kein Access-Datensatz)", () => {
    const decision = checkAccess(null, now);
    expect(decision).toEqual({ allowed: true, markFreeGenerationUsed: true });
  });

  it("erlaubt die Generierung wenn die kostenlose Generierung noch nicht verbraucht wurde", () => {
    const decision = checkAccess({ freeGenerationUsed: false, package: "none", validUntil: null }, now);
    expect(decision).toEqual({ allowed: true, markFreeGenerationUsed: true });
  });

  it("verweigert die Generierung wenn die kostenlose Generierung verbraucht ist und kein Paket aktiv ist", () => {
    const decision = checkAccess({ freeGenerationUsed: true, package: "none", validUntil: null }, now);
    expect(decision).toEqual({ allowed: false, reason: "access_required" });
  });

  it("erlaubt die Generierung bei aktivem zeitlich begrenztem Paket", () => {
    const decision = checkAccess({ freeGenerationUsed: true, package: "limited", validUntil: future }, now);
    expect(decision).toEqual({ allowed: true, markFreeGenerationUsed: false });
  });

  it("verweigert die Generierung bei abgelaufenem zeitlich begrenztem Paket", () => {
    const decision = checkAccess({ freeGenerationUsed: true, package: "limited", validUntil: past }, now);
    expect(decision).toEqual({ allowed: false, reason: "access_required" });
  });

  it("erlaubt die Generierung bei Lifetime-Zugang", () => {
    const decision = checkAccess({ freeGenerationUsed: true, package: "lifetime", validUntil: null }, now);
    expect(decision).toEqual({ allowed: true, markFreeGenerationUsed: false });
  });

  it("erlaubt die Generierung bei aktivem Monatsabo", () => {
    const decision = checkAccess({ freeGenerationUsed: true, package: "monthly", validUntil: null, subscriptionStatus: "active" }, now);
    expect(decision).toEqual({ allowed: true, markFreeGenerationUsed: false });
  });

  it("erlaubt die Generierung bei aktivem Jahresabo", () => {
    const decision = checkAccess({ freeGenerationUsed: true, package: "yearly", validUntil: null, subscriptionStatus: "active" }, now);
    expect(decision).toEqual({ allowed: true, markFreeGenerationUsed: false });
  });

  it("verweigert die Generierung bei gekündigtem Abo", () => {
    const decision = checkAccess({ freeGenerationUsed: true, package: "monthly", validUntil: null, subscriptionStatus: "cancelled" }, now);
    expect(decision).toEqual({ allowed: false, reason: "access_required" });
  });

  it("verweigert die Generierung bei überfälligem Abo", () => {
    const decision = checkAccess({ freeGenerationUsed: true, package: "yearly", validUntil: null, subscriptionStatus: "past_due" }, now);
    expect(decision).toEqual({ allowed: false, reason: "access_required" });
  });
});
