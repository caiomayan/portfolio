// Issue #28: as duas buscas nunca lançam erro: sem token, com a API fora ou com resposta torta, devolvem `null`.
// Roda com o test runner do Node (npm run test:dados), sem navegador.
import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { getActivity, parseActivity } from "../../lib/github-activity.ts";
import { getWeather, weatherKind } from "../../lib/weather.ts";

const realFetch = globalThis.fetch;
const env = { ...process.env };
afterEach(() => {
  globalThis.fetch = realFetch;
  process.env = { ...env };
});

function stubFetch(impl: () => Promise<Response>) {
  const calls = { n: 0 };
  globalThis.fetch = (async () => {
    calls.n++;
    return impl();
  }) as typeof fetch;
  return calls;
}

test("sem GITHUB_TOKEN o gráfico não existe e a API nem é chamada", async () => {
  delete process.env.GITHUB_TOKEN;
  const calls = stubFetch(async () => new Response("{}"));
  assert.equal(await getActivity(), null);
  process.env.GITHUB_TOKEN = "   ";
  assert.equal(await getActivity(), null);
  assert.equal(calls.n, 0);
});

test("com token mas a API do GitHub fora (rede, 5xx, erro do GraphQL), o gráfico não existe", async () => {
  process.env.GITHUB_TOKEN = "token-de-teste";
  stubFetch(async () => {
    throw new Error("rede fora");
  });
  assert.equal(await getActivity(), null);
  stubFetch(async () => new Response("{}", { status: 502 }));
  assert.equal(await getActivity(), null);
  stubFetch(async () => new Response(JSON.stringify({ errors: [{ message: "Bad credentials" }], data: null })));
  assert.equal(await getActivity(), null);
});

test("resposta de contribuições torta vira null; resposta boa vira total e níveis", () => {
  assert.equal(parseActivity(null), null);
  assert.equal(parseActivity({ data: { user: null } }), null);
  const bom = { data: { user: { contributionsCollection: { contributionCalendar: { totalContributions: 3, weeks: [{ contributionDays: [{ contributionCount: 3, contributionLevel: "FOURTH_QUARTILE", color: "#40c463" }] }] } } } } };
  assert.deepEqual(parseActivity(bom), { total: 3, weeks: [[{ count: 3, level: 4 }]] });
  const nivelDesconhecido = structuredClone(bom);
  nivelDesconhecido.data.user.contributionsCollection.contributionCalendar.weeks[0].contributionDays[0].contributionLevel = "MUITO";
  assert.equal(parseActivity(nivelDesconhecido), null);
});

test("clima: API fora, formato torto ou demora viram null; resposta boa arredonda a temperatura", async () => {
  stubFetch(async () => {
    throw new Error("rede fora");
  });
  assert.equal(await getWeather(), null);
  stubFetch(async () => new Response("{}", { status: 500 }));
  assert.equal(await getWeather(), null);
  stubFetch(async () => new Response(JSON.stringify({ current: { temperature_2m: "quente" } })));
  assert.equal(await getWeather(), null);
  stubFetch(async () => new Response(JSON.stringify({ current: { temperature_2m: 27.6, weather_code: 2 } })));
  assert.deepEqual(await getWeather(), { temperature: 28, kind: "partly" });
});

test("código WMO vira o ícone certo", () => {
  assert.equal(weatherKind(0), "clear");
  assert.equal(weatherKind(2), "partly");
  assert.equal(weatherKind(3), "cloudy");
  assert.equal(weatherKind(45), "fog");
  assert.equal(weatherKind(61), "rain");
  assert.equal(weatherKind(95), "storm");
  assert.equal(weatherKind(71), "cloudy");
});
