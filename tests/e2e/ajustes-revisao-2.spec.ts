import { expect, test, type Page } from "./base";
import { rotasTexto } from "./textos";

// Issue #34: ajustes da segunda revisão de design. Contraste e cores são lidos do navegador, nos dois temas.

const rotas = [
  { path: "/", contato: "Contato" },
  { path: "/en", contato: "Contact" },
  { path: "/es", contato: "Contacto" },
] as const;
const temas = ["light", "dark"] as const;

// `color-mix` volta como "color(srgb 0.9 0.9 0.9)" (0 a 1); as cores comuns, como "rgb(251, 251, 253)" (0 a 255).
const rgb = (s: string) => {
  const n = (s.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number);
  return s.startsWith("color(") ? n.map((v) => v * 255) : n;
};
const lum = (c: number[]) => {
  const [r, g, b] = c.map((v) => {
    const x = v / 255;
    return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contraste = (a: number[], b: number[]) => {
  const [x, y] = [lum(a), lum(b)];
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
};

async function abrir(page: Page, path: string, tema: (typeof temas)[number]) {
  await page.addInitScript((tm) => localStorage.setItem("theme", tm), tema);
  await page.goto(path);
}

for (const r of rotas) {
  test.describe(`ajustes da revisão 2 em ${r.path}`, () => {
    for (const vp of [
      { width: 375, height: 667 },
      { width: 390, height: 844 },
    ]) {
      test(`o título e os ícones de contato cabem na primeira tela a ${vp.width}×${vp.height}`, async ({ browser }) => {
        const ctx = await browser.newContext({ viewport: vp });
        const page = await ctx.newPage();
        await page.goto(r.path);
        await page.waitForFunction(() => document.getAnimations().every((a) => a.playState !== "running" || a.effect?.getComputedTiming().iterations === Infinity)); // a entrada (translateY) acabou
        const h1 = (await page.locator("h1").boundingBox())!;
        const link = (await page.locator(".contact-icons").boundingBox())!;
        expect(h1.y + h1.height).toBeLessThan(vp.height);
        expect(link.y + link.height).toBeLessThanOrEqual(vp.height + 1);
        await ctx.close();
      });
    }

    test("Carmine: o que é, como é feito (os dois em --ink), depois a situação, a stack e os links", async ({ page }) => {
      await page.goto(r.path);
      const t = rotasTexto[r.path].carmine;
      const secao = page.locator("#carmine");
      const y = async (loc: ReturnType<Page["locator"]>) => (await loc.boundingBox())!.y;
      const what = secao.getByText(t.what);
      const how = secao.getByText(t.how);
      const status = secao.locator(".status");
      await expect(status).toContainText(t.status);
      expect(await y(what)).toBeLessThan(await y(how));
      expect(await y(how)).toBeLessThan(await y(status));
      expect(await y(status)).toBeLessThan(await y(secao.locator(".icon-row")));
      const ink = await page.evaluate(() => getComputedStyle(document.querySelector("#carmine .carmine-head h2")!).color);
      await expect(what).toHaveCSS("color", ink);
      await expect(how).toHaveCSS("color", ink);
      const soft = await page.evaluate(() => getComputedStyle(document.querySelector(".place")!).color);
      await expect(status).toHaveCSS("color", soft);
    });

    test("o ponto do status fica na altura da primeira linha quando o texto quebra (320 px)", async ({ browser }) => {
      const ctx = await browser.newContext({ viewport: { width: 320, height: 640 } });
      const page = await ctx.newPage();
      await page.goto(r.path);
      const m = await page.locator("#carmine .status").evaluate((el) => {
        const cs = getComputedStyle(el);
        const lh = parseFloat(cs.lineHeight);
        const box = el.getBoundingClientRect();
        const dot = el.querySelector(".status-dot")!.getBoundingClientRect();
        return { linhas: Math.round(box.height / lh), centroDot: dot.top + dot.height / 2 - box.top, meioPrimeiraLinha: lh / 2 };
      });
      expect(m.linhas).toBeGreaterThan(1); // o teste só vale se quebrou
      expect(Math.abs(m.centroDot - m.meioPrimeiraLinha)).toBeLessThan(1.5);
      await ctx.close();
    });

    test("o mapa termina depois do Brasil (sem a África), com os pontos do mesmo tamanho e o texto perto do pino", async ({ browser }) => {
      for (const [w, esperado] of [[1440, 85], [375, 64]] as const) {
        const ctx = await browser.newContext({ viewport: { width: w, height: 800 } });
        const page = await ctx.newPage();
        await page.goto(r.path);
        const m = await page.evaluate(() => {
          const vb = document.querySelector(".place-art svg")!.getAttribute("viewBox")!.split(" ").map(Number);
          const art = document.querySelector(".place-art")!.getBoundingClientRect();
          const pin = document.querySelector(".place-pin")!.getBoundingClientRect();
          const txt = document.querySelector(".place-line")!.getBoundingClientRect();
          return { vbW: vb[2], vbH: vb[3], w: art.width, h: art.height, pinX: pin.x + pin.width / 2, pinDir: pin.right, artX: art.x, artDir: art.right, txtX: txt.x };
        });
        // O recorte tem 90° de altura; a largura em graus sai da proporção do viewBox. Começa em −100°, então termina em −100 + largura.
        const lonMax = -100 + (90 * m.vbW) / m.vbH;
        expect(lonMax, `${w}px: o recorte tem que acabar antes de Dacar (−17,5°)`).toBeLessThan(-17.5);
        expect(lonMax).toBeGreaterThan(-34.88); // e depois de João Pessoa
        // A caixa acompanha o recorte (sem vão vazio): mesma proporção do viewBox.
        expect(m.w / m.h).toBeCloseTo(m.vbW / m.vbH, 1);
        // #36: a altura é a da faixa (96 px no desktop, 72 no celular) e a largura sai do recorte.
        expect(Math.abs(m.w - esperado), `${w}px`).toBeLessThanOrEqual(2);
        // O pino fica dentro da caixa e o texto começa perto dele (antes do #34 eram ~123 px; agora bem menos).
        expect(m.pinDir).toBeLessThanOrEqual(m.artDir);
        expect(m.txtX - m.pinX, `${w}px: pino até o texto`).toBeLessThan(w === 1440 ? 70 : 50);
        await ctx.close();
      }
    });

    for (const tema of temas) {
      test(`o cargo tem estilo próprio (--ink, peso 500) e a empresa segue em --soft (${tema})`, async ({ page }) => {
        await abrir(page, r.path, tema);
        const cargos = page.locator("#experiencia .entry-role");
        await expect(cargos).toHaveCount(2);
        await expect(cargos.first()).toHaveText(rotasTexto[r.path].exp.cargo);
        const ink = await page.evaluate(() => getComputedStyle(document.querySelector("#experiencia h3")!).color);
        const soft = await page.evaluate(() => getComputedStyle(document.querySelector("#experiencia .entry-sub")!).color);
        expect(ink).not.toBe(soft);
        for (const i of [0, 1]) {
          await expect(cargos.nth(i)).toHaveCSS("color", ink);
          await expect(cargos.nth(i)).toHaveCSS("font-weight", "500");
        }
        await expect(page.locator("#experiencia .entry-sub").first()).toHaveCSS("color", soft);
        // O cargo não é mais uma descrição: nenhum .entry-sub tem o texto do cargo.
        await expect(page.locator("#experiencia .entry-sub", { hasText: rotasTexto[r.path].exp.cargo })).toHaveCount(0);
      });

      test(`a grade de contribuições separa o nível 0, o 1 e o fundo (${tema})`, async ({ page }) => {
        await abrir(page, r.path, tema);
        const cores = await page.evaluate(() => {
          const out: Record<string, string> = { bg: getComputedStyle(document.body).backgroundColor };
          for (const n of [0, 1, 2, 3, 4]) {
            const el = document.querySelector(`.activity-day[data-level='${n}']`);
            if (el) out[n] = getComputedStyle(el).backgroundColor;
          }
          return out;
        });
        const bg = rgb(cores.bg);
        const niveis = [0, 1, 2, 3, 4].map((n) => rgb(cores[n] ?? ""));
        expect(niveis.every((c) => c.length === 3), JSON.stringify(cores)).toBe(true);
        expect(contraste(niveis[0], bg), "nível 0 contra o fundo").toBeGreaterThanOrEqual(1.2);
        for (let n = 1; n < 5; n++) {
          expect(contraste(niveis[n], niveis[n - 1]), `nível ${n} contra ${n - 1}`).toBeGreaterThanOrEqual(1.5);
          expect(contraste(niveis[n], bg)).toBeGreaterThan(contraste(niveis[n - 1], bg));
        }
      });

      test(`sem rolagem lateral a 320, 375 e 1440 px (${tema})`, async ({ browser }) => {
        for (const width of [320, 375, 1440]) {
          const ctx = await browser.newContext({ viewport: { width, height: 800 } });
          const page = await ctx.newPage();
          await abrir(page, r.path, tema);
          const sobra = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
          expect(sobra, `${width}px`).toBeLessThanOrEqual(0);
          await ctx.close();
        }
      });
    }
  });
}
