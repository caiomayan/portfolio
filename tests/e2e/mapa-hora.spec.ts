import { expect, test } from "./base";

// Issues #24, #29 e #38: mapa compacto na primeira tela, ao lado de três linhas empilhadas: cidade, hora (sem o fuso na tela) e clima.
const rotas = [
  { path: "/", cidade: "João Pessoa, Brasil" },
  { path: "/en", cidade: "João Pessoa, Brazil" },
  { path: "/es", cidade: "João Pessoa, Brasil" },
] as const;

// Recorte do mapa na primeira tela (lib/map-crop.ts): longitude -100 a -20 (#34), latitude 48 a -42.
const recorte = { lonMin: -100, lonMax: -20, latTop: 48, latBottom: -42 };

for (const r of rotas) {
  test.describe(`mapa e hora em ${r.path}`, () => {
    test("o mapa compacto fica na primeira tela, embaixo da frase, e é centrado na altura das três linhas", async ({ page }) => {
      await page.goto(r.path);
      await expect(page.locator(".place-time")).toHaveText(/^\d{2}:\d{2}$/);
      const lugar = page.locator(".hero .place");
      await expect(lugar.locator(".place-city")).toHaveText(r.cidade);
      const [lead, box] = await Promise.all([page.locator(".hero .lead").boundingBox(), lugar.boundingBox()]);
      expect(box!.y).toBeGreaterThanOrEqual(lead!.y + lead!.height - 1);
      // Três linhas empilhadas: cidade, hora e clima (ícone e temperatura), uma embaixo da outra, alinhadas à esquerda.
      const linhas = [lugar.locator(".place-city"), lugar.locator(".place-time"), lugar.locator(".place-weather")];
      const caixas = await Promise.all(linhas.map((l) => l.boundingBox()));
      for (let i = 1; i < caixas.length; i++) {
        expect(caixas[i]!.y).toBeGreaterThanOrEqual(caixas[i - 1]!.y + caixas[i - 1]!.height - 1);
        expect(Math.abs(caixas[i]!.x - caixas[0]!.x)).toBeLessThanOrEqual(1);
      }
      await expect(lugar.locator(".place-weather")).toContainText(/\d+°C/);
      // O mapa fica centrado na altura das três linhas.
      const mapa = (await lugar.locator(".place-art").boundingBox())!;
      const texto = (await lugar.locator(".place-line").boundingBox())!;
      expect(Math.abs(mapa.y + mapa.height / 2 - (texto.y + texto.height / 2))).toBeLessThanOrEqual(2);
      // Sem o fuso na tela.
      expect(await lugar.innerText()).not.toMatch(/UTC/);
    });

    test("mapa decorativo com o pino em João Pessoa no recorte, cidade e hora em texto", async ({ page }) => {
      await page.goto(r.path);
      const mapa = page.locator(".place-art");
      await expect(mapa).toHaveAttribute("aria-hidden", "true");
      // Mapa e pino medidos no mesmo quadro (um evaluate só): a entrada `rise` do lugar ainda pode estar andando e, com dois pedidos separados,
      // numa máquina carregada (CI em paralelo) eles saíam de quadros diferentes e o pino parecia deslocado uns 5 px.
      const { x, y } = await page.evaluate(() => {
        const box = document.querySelector(".place-art")!.getBoundingClientRect();
        const pin = document.querySelector(".place-pin")!.getBoundingClientRect();
        return { x: (pin.x + pin.width / 2 - box.x) / box.width, y: (pin.y + pin.height / 2 - box.y) / box.height };
      });
      expect(x).toBeCloseTo((-34.88 - recorte.lonMin) / (recorte.lonMax - recorte.lonMin), 1);
      expect(y).toBeCloseTo((recorte.latTop + 7.12) / (recorte.latTop - recorte.latBottom), 1);
      // Em preto e branco: os pontos e o pino usam o cinza do tema.
      const cores = await mapa.evaluate((el) =>
        [...el.querySelectorAll("*"), el].map((e) => getComputedStyle(e).color + getComputedStyle(e).backgroundColor + getComputedStyle(e).fill),
      );
      for (const c of cores) for (const m of c.matchAll(/rgba?\(([\d.]+), ([\d.]+), ([\d.]+)/g)) {
        expect(Math.abs(+m[1] - +m[2])).toBeLessThanOrEqual(6);
        expect(Math.abs(+m[2] - +m[3])).toBeLessThanOrEqual(6);
      }
    });

    test("o pulso só usa transform e opacity e para com movimento reduzido", async ({ page, browser }) => {
      await page.goto(r.path);
      const anim = await page.locator(".place-pulse").evaluate((el) =>
        el.getAnimations().map((x) => ({ props: (x.effect as KeyframeEffect).getKeyframes().flatMap((k) => Object.keys(k)) })),
      );
      expect(anim.length).toBeGreaterThan(0);
      const permitidos = new Set(["offset", "easing", "composite", "computedOffset", "transform", "opacity", "scale", "translate"]);
      for (const a of anim) for (const p of a.props) expect(permitidos.has(p), `propriedade animada: ${p}`).toBe(true);

      const ctx = await browser.newContext({ reducedMotion: "reduce" });
      const p2 = await ctx.newPage();
      await p2.goto(r.path);
      expect(await p2.locator(".place-pulse").evaluate((el) => el.getAnimations().length)).toBe(0);
      await ctx.close();
    });

    test("a 375 px: sem rolagem lateral, mapa dentro da tela e o título não vai pra baixo da dobra", async ({ browser }) => {
      const ctx = await browser.newContext({ viewport: { width: 375, height: 667 } });
      const p = await ctx.newPage();
      await p.goto(r.path);
      await expect(p.locator(".place-time")).toHaveText(/^\d{2}:\d{2}$/);
      expect(await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      const box = (await p.locator(".place-art").boundingBox())!;
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(375);
      const h1 = (await p.locator("h1").boundingBox())!;
      expect(h1.y + h1.height).toBeLessThanOrEqual(667);
      // O bloco do lugar (mapa, cidade, hora) também cabe na primeira tela.
      const lugar = (await p.locator(".hero .place").boundingBox())!;
      expect(lugar.y + lugar.height).toBeLessThanOrEqual(667);
      // Telas estreitas (320 px): continua sem rolagem lateral.
      await p.setViewportSize({ width: 320, height: 640 });
      expect(await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      await ctx.close();
    });

    test("a hora local não vem no HTML do servidor", async ({ request }) => {
      const html = await (await request.get(r.path)).text();
      expect(html).not.toMatch(/UTC/);
      expect(html).toContain(r.cidade);
    });

    test("a hora é a de America/Fortaleza (UTC−3), em qualquer fuso do navegador, e anda a cada minuto", async ({ browser }) => {
      const ctx = await browser.newContext({ timezoneId: "Asia/Tokyo" });
      const p = await ctx.newPage();
      // 17:32 UTC = 14:32 em João Pessoa (em Tóquio seria 02:32).
      await p.clock.install({ time: new Date("2026-06-15T17:32:10Z") });
      await p.goto(r.path);
      const hora = p.locator(".place-time");
      await expect(hora).toHaveText("14:32");
      await p.clock.runFor(60_000);
      await expect(hora).toHaveText("14:33");
      await ctx.close();
    });

    test("a hora entra sem pular o layout", async ({ page }) => {
      await page.goto(r.path);
      await expect(page.locator(".place-time")).toHaveText(/^\d{2}:\d{2}$/);
      const depois = (await page.locator(".hero .place").boundingBox())!.height;
      // Com JavaScript desligado a reserva de espaço é a mesma.
      const ctx = await page.context().browser()!.newContext({ javaScriptEnabled: false });
      const sem = await ctx.newPage();
      await sem.goto(r.path);
      const antes = (await sem.locator(".hero .place").boundingBox())!.height;
      expect(Math.abs(depois - antes)).toBeLessThanOrEqual(1);
      await ctx.close();
    });
  });
}
