import { expect, request, test, type Page } from "./base";
import { SITE_URL } from "@/lib/site";

// Issue #46: idioma automático na primeira visita, JSON-LD, llms.txt e recado no console.
const BASE = `http://localhost:${process.env.E2E_PORT ?? 3100}`;
const CHROME = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36";

/** Pedido sem seguir redirect, com os cabeçalhos dados (sem `Accept-Language`, se não vier). */
async function pedir(headers: Record<string, string>, caminho = "/") {
  const api = await request.newContext({ baseURL: BASE });
  try {
    const res = await api.get(caminho, { headers, maxRedirects: 0 });
    return { status: res.status(), location: res.headers()["location"], cache: res.headers()["cache-control"] };
  } finally {
    await api.dispose();
  }
}

test.describe("redirect de GET / pelo Accept-Language", () => {
  const casos: [string, string, string | undefined][] = [
    ["en-US", "en-US,en;q=0.9", "/en"],
    ["es-MX", "es-MX,es;q=0.9", "/es"],
    ["francês, sem suporte", "fr-FR,fr;q=0.9", "/en"],
    ["francês e depois espanhol", "fr,es;q=0.5", "/es"],
    ["português preferido", "pt-BR,pt;q=0.9,en;q=0.8", undefined],
    ["só português", "pt", undefined],
  ];
  for (const [nome, header, destino] of casos) {
    test(`${nome} (${header}) ${destino ? `vai pra ${destino} com 307, sem cache público` : "fica em /"}`, async () => {
      const r = await pedir({ "Accept-Language": header, "User-Agent": CHROME });
      if (!destino) return expect(r.status).toBe(200);
      expect(r.status).toBe(307);
      expect(new URL(r.location!, BASE).pathname).toBe(destino);
      expect(r.cache).toMatch(/private|no-store/);
    });
  }

  test("sem Accept-Language fica em /", async () => {
    expect((await pedir({ "User-Agent": CHROME })).status).toBe(200);
  });

  test("robôs conhecidos ficam em /, mesmo com Accept-Language em inglês", async () => {
    for (const ua of ["Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)", "Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)", "facebookexternalhit/1.1"]) {
      expect((await pedir({ "Accept-Language": "en-US", "User-Agent": ua })).status, ua).toBe(200);
    }
  });

  test("o cookie salvo vence o Accept-Language", async () => {
    expect((await pedir({ "Accept-Language": "en-US", Cookie: "lang=pt", "User-Agent": CHROME })).status).toBe(200);
    const r = await pedir({ "Accept-Language": "pt-BR", Cookie: "lang=es", "User-Agent": CHROME });
    expect(r.status).toBe(307);
    expect(new URL(r.location!, BASE).pathname).toBe("/es");
  });

  test("só a raiz passa pelo proxy: /en, /es, a OG, o ícone e /llms.txt nunca redirecionam", async () => {
    for (const caminho of ["/en", "/es", "/og/pt", "/icon", "/llms.txt", "/robots.txt", "/sitemap.xml"]) {
      const r = await pedir({ "Accept-Language": "fr-FR", "User-Agent": CHROME }, caminho);
      expect(r.status, caminho).toBe(200);
    }
  });
});

test.describe("no navegador", () => {
  test("navegador em inglês abre / e cai em /en; a escolha manual no seletor fica salva e vence a detecção", async ({ browser }) => {
    const ctx = await browser.newContext({ locale: "en-US" });
    const page = await ctx.newPage();
    await page.goto("/");
    await expect(page).toHaveURL(/\/en$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");

    // Escolhe Português no menu: grava o cookie (1 ano, Lax, Secure) e `/` deixa de redirecionar.
    await page.getByRole("button", { name: /^Language/ }).click();
    await page.getByRole("menuitemradio", { name: "Português" }).click();
    await expect(page).toHaveURL(`${BASE}/`);
    const cookie = (await ctx.cookies()).find((c) => c.name === "lang");
    expect(cookie?.value).toBe("pt");
    expect(cookie?.sameSite).toBe("Lax");
    expect(cookie?.secure).toBe(true);
    expect(cookie!.expires - Date.now() / 1000).toBeGreaterThan(364 * 86400);
    await page.goto("/");
    await expect(page).toHaveURL(`${BASE}/`);
    await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
    await ctx.close();
  });

  test("navegador em português que escolhe English volta pra /en ao abrir /", async ({ page, context }) => {
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
    await page.getByRole("button", { name: /^Idioma/ }).click();
    await page.getByRole("menuitemradio", { name: "English" }).click();
    await expect(page).toHaveURL(/\/en$/);
    expect((await context.cookies()).find((c) => c.name === "lang")?.value).toBe("en");
    await page.goto("/");
    await expect(page).toHaveURL(/\/en$/);
  });
});

const rotas = [
  { path: "/", titulo: "Engenheiro de Software", url: SITE_URL },
  { path: "/en", titulo: "Software Engineer", url: `${SITE_URL}/en` },
  { path: "/es", titulo: "Ingeniero de Software", url: `${SITE_URL}/es` },
];

test.describe("JSON-LD Person", () => {
  for (const r of rotas) {
    test(`${r.path}: um script só, Person na língua da página, só dados públicos`, async ({ page }) => {
      await page.goto(r.path);
      const scripts = page.locator('script[type="application/ld+json"]');
      await expect(scripts).toHaveCount(1);
      const dado = JSON.parse((await scripts.textContent())!);
      expect(dado["@context"]).toBe("https://schema.org");
      expect(dado["@type"]).toBe("Person");
      expect(dado.name).toBe("Caio Mayan");
      expect(dado.jobTitle).toBe(r.titulo);
      expect(dado.url).toBe(r.url);
      expect(dado.image).toMatch(new RegExp(`^${SITE_URL}/.+\\.(jpe?g|png|webp)$`));
      expect(dado.sameAs).toEqual(["https://www.linkedin.com/in/caiomayan/", "https://github.com/caiomayan"]);
      expect(Object.keys(dado).sort()).toEqual(["@context", "@type", "description", "image", "jobTitle", "name", "sameAs", "url"]);
    });
  }
});

test("llms.txt: em inglês, gerado de content/, com as três versões", async ({ request }) => {
  const res = await request.get("/llms.txt");
  expect(res.status()).toBe(200);
  expect(res.headers()["content-type"]).toMatch(/text\/plain/);
  const texto = await res.text();
  expect(texto).toMatch(/^# Caio Mayan\n\n> Software Engineer\. On the path to AI engineering: LLMs, agents and the backend that holds them up\./);
  expect(texto).toContain(`[Português](${SITE_URL})`);
  expect(texto).toContain(`[English](${SITE_URL}/en)`);
  expect(texto).toContain(`[Español](${SITE_URL}/es)`);
  expect(texto).toContain("https://github.com/caiomayan/portfolio");
});

const recados = [
  { path: "/", texto: "Curioso? O código deste site é aberto:" },
  { path: "/en", texto: "Curious? This site's code is open:" },
  { path: "/es", texto: "¿Curioso? El código de este sitio es abierto:" },
];

test.describe("recado no console", () => {
  const ouvir = (page: Page) => {
    const msgs: { tipo: string; texto: string }[] = [];
    page.on("console", (m) => msgs.push({ tipo: m.type(), texto: m.text() }));
    page.on("pageerror", (e) => msgs.push({ tipo: "pageerror", texto: e.message }));
    return msgs;
  };
  for (const r of recados) {
    test(`${r.path}: uma mensagem info, na língua da página, com o link do repositório, e nenhum erro`, async ({ page }) => {
      const msgs = ouvir(page);
      await page.goto(r.path);
      await expect.poll(() => msgs.filter((m) => m.texto.includes(r.texto)).length, { timeout: 8000 }).toBe(1);
      const recado = msgs.find((m) => m.texto.includes(r.texto))!;
      expect(recado.tipo).toBe("info");
      expect(recado.texto).toContain("https://github.com/caiomayan/portfolio");
      expect(msgs.filter((m) => m.tipo === "error" || m.tipo === "pageerror")).toEqual([]);
    });
  }
});

test("título da aba: só o nome, nas três páginas e na 404; og:title mantém o cargo (#46)", async ({ page }) => {
  for (const p of ["/", "/en", "/es", "/nao-existe"]) {
    await page.goto(p);
    await expect(page, p).toHaveTitle("Caio Mayan");
  }
  await page.goto("/en");
  await expect(page.locator('head meta[property="og:title"]')).toHaveAttribute("content", "Caio Mayan — Software Engineer");
});

test("favicon (transparente) e apple-icon (fundo opaco --bg): PNG com o círculo claro em cima e escuro embaixo e contorno neutro (#46)", async ({ page }) => {
  await page.goto("/");
  const href = (sel: string) => page.locator(sel).first().getAttribute("href");
  const icone = new URL((await href('head link[rel="icon"]'))!, "http://x").pathname;
  const apple = new URL((await href('head link[rel="apple-touch-icon"]'))!, "http://x").pathname;
  for (const [caminho, lado] of [[icone, 32], [apple, 180]] as const) {
    const r = await page.evaluate(async ([p, n]) => {
      const bmp = await createImageBitmap(await (await fetch(p as string)).blob());
      const c = document.createElement("canvas");
      c.width = c.height = n as number;
      const ctx = c.getContext("2d")!;
      ctx.drawImage(bmp, 0, 0);
      const px = (x: number, y: number) => Array.from(ctx.getImageData(x, y, 1, 1).data);
      const m = (n as number) >> 1;
      const q = Math.round((n as number) * 0.3);
      return { w: bmp.width, canto: px(0, 0), cima: px(m, q), baixo: px(m, (n as number) - q), borda: px(m, 1 + Math.floor((n as number) / 40)) };
    }, [caminho, lado] as const);
    expect(r.w, caminho).toBe(lado);
    if (caminho === icone) expect(r.canto[3], `${caminho} (aba) tem canto transparente`).toBe(0);
    else expect(r.canto, `${caminho} (apple-icon) tem fundo opaco --bg`).toEqual([251, 251, 253, 255]); // o iOS pinta transparência de preto na tela inicial
    expect(r.cima[0], `${caminho} cima mais claro que baixo`).toBeGreaterThan(r.baixo[0] + 60);
    expect(r.cima[3]).toBe(255);
    expect(r.baixo[3]).toBe(255);
    expect(Math.abs(r.borda[0] - r.borda[2]), `${caminho} contorno sem cor`).toBeLessThanOrEqual(4);
  }
});
