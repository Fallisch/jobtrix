import { config } from "dotenv";
import { defineConfig, devices } from "@playwright/test";

config({ path: ".env" });
config({ path: ".env.local", override: true });

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  // Begrenzt auf 4 Worker: Bei höherer Parallelität überlastet die Vielzahl an
  // gleichzeitigen Registrierungs-/Login-Flows (bcrypt-Hashing, NextAuth-CSRF)
  // den Next.js-Dev-Server, was zu flaky Auth-Timeouts führt (siehe Issue #24).
  workers: 4,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    // E2E-Tests teilen sich dieselbe (localhost-)IP. Mit dem Produktions-Default
    // (5 Registrierungen / 15 min pro IP) liefe das IP-Rate-Limit sofort voll und
    // Registrierungs-/Login-Flows scheiterten mit 429. Für die Testumgebung daher
    // effektiv deaktiviert; kein E2E-Test prüft Rate-Limiting.
    env: {
      RATE_LIMIT_MAX: "100000",
    },
  },
});
