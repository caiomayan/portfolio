// Servidor falso do Open-Meteo e do GitHub, só pros testes e2e: o build lê as URLs de OPEN_METEO_URL e GITHUB_GRAPHQL_URL.
// Assim o build de produção testado não depende de rede nem do token de verdade.
import { createServer } from "node:http";

const PORT = Number(process.env.MOCK_APIS_PORT || 3199);
export const TEST_TOKEN = "token-de-teste-nao-e-segredo";

/** 53 semanas de 7 dias, com os 5 níveis em padrão fixo. */
function calendar() {
  const names = ["NONE", "FIRST_QUARTILE", "SECOND_QUARTILE", "THIRD_QUARTILE", "FOURTH_QUARTILE"];
  const weeks = Array.from({ length: 53 }, (_, w) => ({
    contributionDays: Array.from({ length: 7 }, (_, d) => {
      const level = (w * 7 + d) % 5;
      return { contributionCount: level * 2, contributionLevel: names[level], color: "#40c463" };
    }),
  }));
  return { totalContributions: 1234, weeks };
}

createServer((req, res) => {
  const url = new URL(req.url ?? "/", "http://x");
  const send = (status, body) => {
    res.writeHead(status, { "content-type": "application/json" });
    res.end(JSON.stringify(body));
  };
  if (url.pathname === "/health") return send(200, { ok: true });
  if (url.pathname === "/weather") return send(200, { current: { temperature_2m: 27.6, weather_code: 2 } });
  if (url.pathname === "/weather-erro") return send(500, { error: true });
  if (url.pathname === "/github-erro") return send(502, { error: true });
  if (url.pathname === "/github" && req.method === "POST") {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", () => {
      if (req.headers.authorization !== `Bearer ${TEST_TOKEN}`) return send(401, { message: "Bad credentials" });
      const parsed = JSON.parse(body);
      if (!String(parsed.query).includes("contributionsCollection") || parsed.variables?.login !== "caiomayan") return send(400, { errors: [{ message: "consulta inesperada" }] });
      send(200, { data: { user: { contributionsCollection: { contributionCalendar: calendar() } } } });
    });
    return;
  }
  send(404, { error: "not found" });
}).listen(PORT, "127.0.0.1");
