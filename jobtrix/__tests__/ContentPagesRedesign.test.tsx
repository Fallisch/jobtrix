import fs from "fs";
import path from "path";

const contentFiles = [
  "HilfeContent.tsx",
  "ImpressumContent.tsx",
  "DatenschutzContent.tsx",
  "AgbContent.tsx",
];

const sources = contentFiles.map((file) => ({
  name: file,
  content: fs.readFileSync(path.join(__dirname, "..", "components", file), "utf-8"),
}));

const adminSource = fs.readFileSync(
  path.join(__dirname, "..", "components", "AdminDashboard.tsx"),
  "utf-8"
);

describe("Content Pages Redesign", () => {
  test.each(sources)(
    "$name: hat konsistentes Layout (max-w, px-4, py-8)",
    ({ content }) => {
      expect(content).toMatch(/max-w-/);
      expect(content).toContain("px-4");
      expect(content).toContain("py-8");
    }
  );

  test("HilfeContent-Karten haben rounded-2xl und shadow-sm", () => {
    const hilfe = sources.find((s) => s.name === "HilfeContent.tsx")!;
    expect(hilfe.content).toContain("rounded-2xl");
    expect(hilfe.content).toContain("shadow-sm");
  });
});

describe("AdminDashboard Redesign", () => {
  test("Karten haben rounded-2xl", () => {
    const cards = adminSource.match(/bg-white dark:bg-surface.*?rounded-\S+/g) || [];
    for (const card of cards) {
      expect(card).toContain("rounded-2xl");
    }
  });

  test("Tabelle hat rounded-2xl border", () => {
    expect(adminSource).toMatch(/overflow.*rounded-2xl/);
  });

  test("Karten haben shadow-sm", () => {
    expect(adminSource).toContain("shadow-sm");
  });
});
