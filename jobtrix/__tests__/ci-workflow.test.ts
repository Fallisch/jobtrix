/**
 * @jest-environment node
 */
import * as fs from "fs";
import * as path from "path";

const WORKFLOW_PATH = path.join(__dirname, "../../.github/workflows/ci.yml");

function workflowContent(): string {
  return fs.readFileSync(WORKFLOW_PATH, "utf-8");
}

describe("GitHub Actions CI-Workflow", () => {
  it("ci.yml existiert im Repository", () => {
    expect(fs.existsSync(WORKFLOW_PATH)).toBe(true);
  });

  it("läuft bei Push auf main", () => {
    const content = workflowContent();
    expect(content).toContain("push");
    expect(content).toContain("main");
  });

  it("läuft bei Pull Request auf main", () => {
    const content = workflowContent();
    expect(content).toContain("pull_request");
  });

  it("enthält npm run lint", () => {
    expect(workflowContent()).toContain("npm run lint");
  });

  it("enthält npm test", () => {
    expect(workflowContent()).toContain("npm test");
  });

  it("enthält npm run test:e2e", () => {
    expect(workflowContent()).toContain("npm run test:e2e");
  });

  it("enthält einen PostgreSQL-Service-Container", () => {
    const content = workflowContent();
    expect(content).toContain("postgres");
    expect(content).toContain("services");
  });
});
