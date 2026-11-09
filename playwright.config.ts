import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;

// Os testes rodam contra o build de produção (next build + next start).
// No CI o build é um passo à parte (typecheck, lint, build, testes); aqui só se sobe o servidor.
export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  reporter: process.env.CI ? [["list"], ["github"]] : [["list"]],
  use: { baseURL: `http://localhost:${PORT}` },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: process.env.CI ? `npx next start -p ${PORT}` : `npm run build && npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,
  },
});
