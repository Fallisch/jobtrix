import fs from "fs";
import path from "path";

const listSource = fs.readFileSync(
  path.join(__dirname, "..", "components", "ApplicationHistoryList.tsx"),
  "utf-8"
);
const detailSource = fs.readFileSync(
  path.join(__dirname, "..", "components", "ApplicationHistoryDetail.tsx"),
  "utf-8"
);

describe("Application History Redesign", () => {
  test("List-Karten haben rounded-2xl", () => {
    const cardMatches = listSource.match(/bg-white dark:bg-surface rounded-\S+/g) || [];
    for (const match of cardMatches) {
      expect(match).toContain("rounded-2xl");
    }
  });

  test("List-Karten haben shadow-sm und hover:shadow-md", () => {
    expect(listSource).toContain("shadow-sm");
    expect(listSource).toContain("hover:shadow-md");
  });

  test("List-Karten haben hover:scale-[1.02]", () => {
    expect(listSource).toContain("hover:scale-[1.02]");
  });

  test("Detail-Sektionen haben rounded-2xl", () => {
    const sectionMatches = detailSource.match(/bg-white dark:bg-surface rounded-\S+/g) || [];
    for (const match of sectionMatches) {
      expect(match).toContain("rounded-2xl");
    }
  });

  test("Detail hat Tab-Navigation mit border-b", () => {
    expect(detailSource).toContain("tablist");
    expect(detailSource).toContain("border-b");
  });

  test("Detail hat border auf Karten", () => {
    expect(detailSource).toMatch(/border border-gray/);
  });
});
