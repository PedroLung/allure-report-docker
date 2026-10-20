import { defineConfig } from "@playwright/test";

const PORT = 3000;

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  reporter: [
    ["list"],
    [
      "allure-playwright",
      {
        resultsDir: "allure-results",
        detail: true,
        suiteTitle: false,
        environmentInfo: {
          node: process.version,
          os: process.platform,
          ci: process.env.CI ? "github-actions" : "local",
        },
      },
    ],
  ],
  use: {
    baseURL: `http://localhost:${PORT}`,
  },
  // Sobe a API de exemplo antes dos testes e derruba no final.
  webServer: {
    command: "node app/server.js",
    url: `http://localhost:${PORT}/health`,
    reuseExistingServer: !process.env.CI,
  },
});
