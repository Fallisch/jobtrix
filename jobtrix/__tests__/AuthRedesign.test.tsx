import fs from "fs";
import path from "path";

const componentsDir = path.join(__dirname, "..", "components");

const authForms = [
  "LoginForm.tsx",
  "RegisterForm.tsx",
  "ForgotPasswordForm.tsx",
  "ResetPasswordForm.tsx",
];

describe("Auth Pages Redesign", () => {
  const sources = authForms.map((file) => ({
    name: file,
    content: fs.readFileSync(path.join(componentsDir, file), "utf-8"),
  }));

  test.each(sources)(
    "$name: Eingabefelder haben rounded-xl",
    ({ content }) => {
      const inputMatches = content.match(/<input[\s\S]*?className="[^"]*"/g) || [];
      for (const match of inputMatches) {
        if (match.includes("checkbox") || match.includes("h-4")) continue;
        expect(match).toContain("rounded-xl");
      }
    }
  );

  test.each(sources)(
    "$name: Formular-Karte hat rounded-2xl und shadow-sm",
    ({ content }) => {
      expect(content).toContain("rounded-2xl");
      expect(content).toContain("shadow-sm");
    }
  );

  test.each(sources)(
    "$name: Eingabefelder haben min-h-[44px]",
    ({ content }) => {
      const inputMatches = content.match(/<input[\s\S]*?className="[^"]*"/g) || [];
      for (const match of inputMatches) {
        if (match.includes("checkbox") || match.includes("h-4")) continue;
        expect(match).toContain("min-h-[44px]");
      }
    }
  );

  test.each(sources)(
    "$name: Eingabefelder haben focus:ring-accent/50",
    ({ content }) => {
      const inputMatches = content.match(/<input[\s\S]*?className="[^"]*"/g) || [];
      for (const match of inputMatches) {
        if (match.includes("checkbox") || match.includes("h-4")) continue;
        expect(match).toContain("focus:ring-accent/50");
      }
    }
  );
});
