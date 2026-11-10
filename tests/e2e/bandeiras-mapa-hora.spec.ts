import { expect, test } from "@playwright/test";
import { rotasTexto } from "./textos";

// Issues #24 e #29: seletor de língua com as duas bandeiras, mapa compacto na primeira tela (no lugar da linha da cidade), com hora local.
const rotas = [
  { path: "/", atual: "BR", paisAtual: "Brasil", outra: "US", pais: "Estados Unidos", destino: "/en", lang: "en", linguaAtual: "Português", cidade: "João Pessoa, Brasil" },
  { path: "/en", atual: "US", paisAtual: "United States", outra: "BR", pais: "Brazil", destino: "/", lang: "pt", linguaAtual: "English", cidade: "João Pessoa, Brazil" },
] as const;

// Recorte do mapa na primeira tela (lib/map-crop.ts): longitude -100 a 20, latitude 48 a -42.
const recorte = { lonMin: -100, lonMax: 20, latTop: 48, latBottom: -42 };

for (const r of rotas) {
  const t = rotasTexto[r.path];
  test.describe(`seletor, mapa e hora em ${r.path}`, () => {
    test("seletor com as duas bandeiras: a atual em destaque com aria-current, a outra é o link", async ({ page }) => {
      await page.goto(r.path);
      const seletor = page.locator(".top .lang-switch");
      await expect(seletor.locator("svg.lang-flag")).toHaveCount(2);
      // Atual: não é link, tem aria-current="page" e o nome da língua só em texto pra leitor de tela.
      const atual = seletor.locator('[aria-current="page"]');
      await expect(atual).toHaveCount(1);
      await expect(atual.locator("svg")).toHaveAttribute("data-flag", r.atual);
      await expect(atual).toContainText(r.linguaAtual);
      expect(await atual.evaluate((el) => el.tagName)).not.toBe("A");
      // Outra: o único link, com nome acessível, lang e hreflang da língua de destino.
      await expect(seletor.getByRole("link")).toHaveCount(1);
      const link = page.getByRole("link", { name: t.outraLingua });
      await expect(link).toHaveAttribute("href", r.destino);
      await expect(link).toHaveAttribute("lang", r.lang);
      await expect(link).toHaveAttribute("hreflang", r.lang === "en" ? "en" : "pt-BR");
      await expect(link.locator("svg")).toHaveAttribute("data-flag", r.outra);
      await expect(link.locator("svg")).toHaveAttribute("aria-hidden", "true");
      // Só bandeiras: nenhum texto visível.
      expect(((await link.innerText()) ?? "").trim()).toBe("");
      // Ordem fixa (português, inglês) e a atual com cor cheia, a outra apagada.
      const ordem = await seletor.locator("svg.lang-flag").evaluateAll((els) => els.map((e) => e.getAttribute("data-flag")));
      expect(ordem).toEqual(["BR", "US"]);
      const op = async (l: typeof atual) => Number(await l.evaluate((el) => getComputedStyle(el).opacity));
      expect(await op(atual)).toBe(1);
      expect(await op(link)).toBeLessThan(0.8);
      // Marca sutil de selecionado na atual (pseudo-elemento), nenhuma na outra.
      expect(await atual.evaluate((el) => getComputedStyle(el, "::after").content)).not.toBe("none");
      expect(await link.evaluate((el) => getComputedStyle(el, "::after").content)).toBe("none");
      // Sem fundo em repouso.
      for (const el of [atual, link]) expect(await el.evaluate((e) => getComputedStyle(e).backgroundColor)).toBe("rgba(0, 0, 0, 0)");
    });

    test("cada bandeira tem tooltip com o nome do país (no hover; a que é link também no foco)", async ({ page }) => {
      await page.goto(r.path);
      const atual = page.locator('.top .lang-switch [aria-current="page"]');
      const link = page.getByRole("link", { name: t.outraLingua });
      await link.hover();
      await expect(page.locator(".tip-bubble")).toHaveText(r.pais);
      await atual.hover();
      await expect(page.locator(".tip-bubble")).toHaveText(r.paisAtual);
      await page.mouse.move(0, 400);
      await expect(page.locator(".tip-bubble")).toHaveCount(0);
      await link.focus();
      await expect(page.locator(".tip-bubble")).toHaveText(r.pais);
    });

    test("as bandeiras são a única cor da barra do topo", async ({ page }) => {
      await page.goto(r.path);
      const cores = await page.locator(".top").evaluate((top) => {
        const out: string[] = [];
        for (const el of [top, ...top.querySelectorAll("*")]) {
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

    test("o mapa compacto fica na primeira tela, embaixo da frase, e some do Contato", async ({ page }) => {
      await page.goto(r.path);
      await expect(page.locator(".contact-map")).toHaveCount(0);
      await expect(page.locator(".contact .place-art")).toHaveCount(0);
      const lugar = page.locator(".hero .place");
      await expect(lugar.locator(".place-city")).toHaveText(r.cidade);
      const [lead, box] = await Promise.all([page.locator(".hero .lead").boundingBox(), lugar.boundingBox()]);
      expect(box!.y).toBeGreaterThanOrEqual(lead!.y + lead!.height - 1);
      // O Contato segue com e-mail, ícones e as línguas.
      await expect(page.locator(".contact .mail-address")).toBeVisible();
      await expect(page.locator(".contact .contact-links li")).toHaveCount(3);
      await expect(page.locator(".contact .contact-languages")).toBeVisible();
    });

    test("mapa decorativo com o pino em João Pessoa no recorte, cidade e hora em texto", async ({ page }) => {
      await page.goto(r.path);
      const mapa = page.locator(".place-art");
      await expect(mapa).toHaveAttribute("aria-hidden", "true");
      const box = (await mapa.boundingBox())!;
      const pin = (await page.locator(".place-pin").boundingBox())!;
      const x = (pin.x + pin.width / 2 - box.x) / box.width;
      const y = (pin.y + pin.height / 2 - box.y) / box.height;
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
      await expect(p.locator(".place-time")).toHaveText(/\d{2}:\d{2}/);
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
      expect(html).not.toMatch(/\d{2}:\d{2}\s*\(UTC/);
      expect(html).toContain(r.cidade);
    });

    test("a hora é a de America/Fortaleza (UTC−3), em qualquer fuso do navegador, e anda a cada minuto", async ({ browser }) => {
      const ctx = await browser.newContext({ timezoneId: "Asia/Tokyo" });
      const p = await ctx.newPage();
      // 17:32 UTC = 14:32 em João Pessoa (em Tóquio seria 02:32).
      await p.clock.install({ time: new Date("2026-06-15T17:32:10Z") });
      await p.goto(r.path);
      const hora = p.locator(".place-time");
      await expect(hora).toHaveText("14:32 (UTC−3)");
      await p.clock.runFor(60_000);
      await expect(hora).toHaveText("14:33 (UTC−3)");
      await ctx.close();
    });

    test("a hora entra sem pular o layout", async ({ page }) => {
      await page.goto(r.path);
      await expect(page.locator(".place-time")).toHaveText(/\d{2}:\d{2} \(UTC−3\)/);
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
