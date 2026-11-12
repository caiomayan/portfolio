import { defineConfig, devices } from "@playwright/test";

// As portas podem ser trocadas por variável (E2E_PORT, E2E_PORT_FALHA, E2E_PORT_APIS) pra dois checkouts rodarem testes ao mesmo tempo.
const PORT = Number(process.env.E2E_PORT ?? 3100);
const PORT_FALHA = Number(process.env.E2E_PORT_FALHA ?? 3101);
const PORT_APIS = Number(process.env.E2E_PORT_APIS ?? 3199);
const APIS = `http://127.0.0.1:${PORT_APIS}`;

// Dados ao vivo (#28): o build lê as APIs de variáveis de ambiente, então os testes apontam pro servidor falso de tests/fixtures/apis.mjs.
// O token abaixo é só do servidor falso (não é segredo). Dois builds: um com as APIs respondendo (.next) e um com as duas falhando (.next-falha).
export const TEST_TOKEN = "token-de-teste-nao-e-segredo";
export const buildEnv = {
  ok: { ALLOW_TEST_API_URLS: "1", OPEN_METEO_URL: `${APIS}/weather`, GITHUB_GRAPHQL_URL: `${APIS}/github`, GITHUB_TOKEN: TEST_TOKEN },
  falha: { ALLOW_TEST_API_URLS: "1", OPEN_METEO_URL: `${APIS}/weather-erro`, GITHUB_GRAPHQL_URL: `${APIS}/github-erro`, GITHUB_TOKEN: TEST_TOKEN, NEXT_DIST_DIR: ".next-falha" },
};

// Locale pt-BR em todos os projetos (#46): o idioma automático redireciona `/` pela língua do navegador, e os testes partem da versão em português.
// Os testes rodam contra o build de produção (next build + next start).
// No CI o build é um passo à parte (typecheck, lint, build, testes); aqui só se sobe o servidor.
export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  reporter: process.env.CI ? [["list"], ["github"]] : [["list"]],
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"], locale: "pt-BR", baseURL: `http://localhost:${PORT}` }, testIgnore: /falha-dados/ },
    { name: "apis-falhando", use: { ...devices["Desktop Chrome"], locale: "pt-BR", baseURL: `http://localhost:${PORT_FALHA}` }, testMatch: /falha-dados/ },
  ],
  webServer: [
    { command: "node tests/fixtures/apis.mjs", url: `${APIS}/health`, reuseExistingServer: !process.env.CI, env: { MOCK_APIS_PORT: String(PORT_APIS) } },
    {
      command: process.env.CI ? `npx next start -p ${PORT}` : `npm run build && npx next start -p ${PORT}`,
      url: `http://localhost:${PORT}`,
      reuseExistingServer: !process.env.CI,
      timeout: 240_000,
      env: buildEnv.ok,
    },
    {
      command: process.env.CI ? `npx next start -p ${PORT_FALHA}` : `npm run build && npx next start -p ${PORT_FALHA}`,
      url: `http://localhost:${PORT_FALHA}`,
      reuseExistingServer: !process.env.CI,
      timeout: 240_000,
      env: buildEnv.falha,
    },
  ],
});
