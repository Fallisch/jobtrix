import de from "@/messages/de.json";
import en from "@/messages/en.json";

function collectKeys(obj: Record<string, unknown>, prefix = ""): string[] {
  return Object.entries(obj).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      return collectKeys(value as Record<string, unknown>, path);
    }
    return [path];
  });
}

function getByPath(obj: Record<string, unknown>, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, part) => (acc as Record<string, unknown> | undefined)?.[part], obj);
}

describe("profile-Übersetzungen (DE/EN)", () => {
  it("enthalten dieselben Keys in messages/de.json und messages/en.json", () => {
    const deKeys = collectKeys(de.profile).sort();
    const enKeys = collectKeys(en.profile).sort();
    expect(enKeys).toEqual(deKeys);
  });

  it("enthalten für jeden profile-Key einen nicht-leeren Übersetzungstext in beiden Sprachen", () => {
    for (const key of collectKeys(de.profile)) {
      const deValue = getByPath(de.profile, key);
      const enValue = getByPath(en.profile, key);
      expect(typeof deValue).toBe("string");
      expect((deValue as string).length).toBeGreaterThan(0);
      expect(typeof enValue).toBe("string");
      expect((enValue as string).length).toBeGreaterThan(0);
    }
  });
});
