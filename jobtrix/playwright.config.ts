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
  },
});
