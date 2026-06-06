import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({ dir: "./" });

const config: Config = {
  coverageProvider: "v8",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testPathIgnorePatterns: ["/node_modules/", "/e2e/"],
  moduleNameMapper: {
    "^next-intl/config$": "<rootDir>/__mocks__/next-intl-config.js",
    "^@/(.*)$": "<rootDir>/$1",
  },
};

export default createJestConfig(config);
