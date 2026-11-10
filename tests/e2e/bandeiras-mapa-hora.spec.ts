import { expect, test } from "@playwright/test";
import { rotasTexto } from "./textos";

// Issue #24: bandeira no seletor de língua, mapa com o pino em João Pessoa e hora local no Contato.
const rotas = [
  { path: "/", flag: "US", pais: "Estados Unidos", destino: "/en", lang: "en", cidade: "João Pessoa, Brasil" },
  { path: "/en", flag: "BR", pais: "Brazil", destino: "/", lang: "pt", cidade: "João Pessoa, Brazil" },
] as const;

for (const r of rotas) {
  const t = rotasTexto[r.path];
  test.describe(`bandeira, mapa e hora em ${r.path}`, () => {
    test("o link de língua mostra só a bandeira, com nome acessível da língua e tooltip do país", async ({ page }) => {
      await page.goto(r.path);
      const link = page.getByRole("link", { name: t.outraLingua });
      await expect(link).toHaveAttribute("href", r.destino);
      await expect(link).toHaveAttribute("lang", r.lang);
      await expect(link).toHaveAttribute("hreflang", r.lang === "en" ? "en" : "pt-BR");
      await expect(link.locator("svg")).toHaveCount(1);
      await expect(link.locator("svg")).toHaveAttribute("data-flag", r.flag);
      await expect(link.locator("svg")).toHaveAttribute("aria-hidden", "true");
      // Só a bandeira: nenhum texto visível dentro do link.
      expect(((await link.innerText()) ?? "").trim()).toBe("");
      // Sem fundo em repouso.
      expect(await link.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe("rgba(0, 0, 0, 0)");
      // Tooltip no hover e no foco.
      await link.hover();
      await expect(page.locator(".tip-bubble")).toHaveText(r.pais);
      await page.mouse.move(0, 400);
      await expect(page.locator(".tip-bubble")).toHaveCount(0);
      await link.focus();
      await expect(page.locator(".tip-bubble")).toHaveText(r.pais);
    });

    test("a bandeira é a única cor da barra do topo", async ({ page }) => {
      await page.goto(r.path);
      const cores = await page.locator(".top").evaluate((top) => {
        const out: string[] = [];
        for (const el of top.querySelectorAll("*")) {
          const cs = getComputedStyle(el);
          for (const p of [cs.color, cs.backgroundColor, cs.borderTopColor]) {
            const m = /^rgba?\(/.test(p) ? p.match(/[\d.]+/g)!.map(Number) : null;
            if (m && (Math.abs(m[0] - m[1]) > 6 || Math.abs(m[1] - m[2]) > 6)) out.push(`${el.tagName} ${p}`);
          }
        }
        return out;
      });
      expect(cores).toEqual([]);
    });

    test("mapa decorativo com o pino em João Pessoa, cidade e hora em texto", async ({ page }) => {
      await page.goto(r.path);
      const mapa = page.locator(".contact-map-art");
      await expect(mapa).toHaveAttribute("aria-hidden", "true");
      await expect(page.locator(".contact-map-place")).toHaveText(r.cidade);
      // Pino na posição certa da projeção equiretangular (7,12° S, 34,88° O) dentro da faixa 78° N a 58° S.
      await mapa.scrollIntoViewIfNeeded();
      const box = (await mapa.boundingBox())!;
      const pin = (await page.locator(".contact-map-pin").boundingBox())!;
      const x = (pin.x + pin.width / 2 - box.x) / box.width;
      const y = (pin.y + pin.height / 2 - box.y) / box.height;
      expect(x).toBeCloseTo((-34.88 + 180) / 360, 2);
      expect(y).toBeCloseTo((78 + 7.12) / (78 + 58), 2);
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
      const pulso = page.locator(".contact-map-pulse");
      // Sem scrollIntoViewIfNeeded no pulso: a animação infinita nunca deixa o elemento "estável" pro Playwright.
      await page.locator(".contact-map-art").scrollIntoViewIfNeeded();
      const anim = await pulso.evaluate((el) => {
        const a = el.getAnimations().map((x) => ({ props: (x.effect as KeyframeEffect).getKeyframes().flatMap((k) => Object.keys(k)) }));
        return a;
      });
      expect(anim.length).toBeGreaterThan(0);
      const permitidos = new Set(["offset", "easing", "composite", "computedOffset", "transform", "opacity", "scale", "translate"]);
      for (const a of anim) for (const p of a.props) expect(permitidos.has(p), `propriedade animada: ${p}`).toBe(true);

      const ctx = await browser.newContext({ reducedMotion: "reduce" });
      const p2 = await ctx.newPage();
      await p2.goto(r.path);
      expect(await p2.locator(".contact-map-pulse").evaluate((el) => el.getAnimations().length)).toBe(0);
      await ctx.close();
    });

    test("sem rolagem lateral a 375 px", async ({ browser }) => {
      const ctx = await browser.newContext({ viewport: { width: 375, height: 800 } });
      const p = await ctx.newPage();
      await p.goto(r.path);
      await p.locator(".contact-map").scrollIntoViewIfNeeded();
      expect(await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      const box = (await p.locator(".contact-map-art").boundingBox())!;
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(375);
      await ctx.close();
    });

    test("a hora local não vem no HTML do servidor", async ({ request }) => {
      const html = await (await request.get(r.path)).text();
      expect(html).not.toMatch(/\d{2}:\d{2}\s*\(UTC/);
      expect(html).toContain(r.cidade);
    });

    test("a hora é a de America/Fortaleza (UTC−3), em qualquer fuso do navegador, e anda a cada minuto", async ({ browser }) => {
      const ctx = await browser.newContext({ timezoneId: "Asia/Tokyo" });
      const p = await ctx.newPage();
      // 17:32 UTC = 14:32 em João Pessoa (em Tóquio seria 02:32).
      await p.clock.install({ time: new Date("2026-06-15T17:32:10Z") });
      await p.goto(r.path);
      const hora = p.locator(".contact-map-time");
      await expect(hora).toHaveText("14:32 (UTC−3)");
      await p.clock.runFor(60_000);
      await expect(hora).toHaveText("14:33 (UTC−3)");
      await ctx.close();
    });

    test("a hora entra sem pular o layout", async ({ page }) => {
      await page.goto(r.path);
      const hora = page.locator(".contact-map-time");
      await hora.scrollIntoViewIfNeeded();
      await expect(hora).toHaveText(/\d{2}:\d{2} \(UTC−3\)/);
      const depois = (await page.locator(".contact").boundingBox())!.height;
      // Com JavaScript desligado a reserva de espaço é a mesma.
      const ctx = await page.context().browser()!.newContext({ javaScriptEnabled: false });
      const sem = await ctx.newPage();
      await sem.goto(r.path);
      const antes = (await sem.locator(".contact").boundingBox())!.height;
      expect(Math.abs(depois - antes)).toBeLessThanOrEqual(1);
      await ctx.close();
    });
  });
}
