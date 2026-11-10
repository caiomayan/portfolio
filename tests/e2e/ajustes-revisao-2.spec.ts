import { expect, test, type Page } from "@playwright/test";
import { rotasTexto } from "./textos";

// Issue #34: ajustes da segunda revisão de design. Contraste e cores são lidos do navegador, nos dois temas.

const rotas = [
  { path: "/", contato: "Contato" },
  { path: "/en", contato: "Contact" },
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
    test("o link de texto leva a #contato, em --soft, embaixo do lugar", async ({ page }) => {
      await page.goto(r.path);
      const link = page.locator(".hero").getByRole("link", { name: r.contato, exact: true });
      await expect(link).toHaveAttribute("href", "#contato");
      await expect(link).toContainText("↓");
      // Posição de layout (offsetTop), não boundingBox: o lugar entra com `rise` (translateY) e, no CI lento, ainda estaria em movimento.
      const m = await page.evaluate(() => {
        const place = document.querySelector<HTMLElement>(".place")!;
        const a = document.querySelector<HTMLElement>(".hero .to-contact")!;
        const parent = place.offsetParent;
        return { placeBottom: place.offsetTop + place.offsetHeight, linkTop: a.offsetTop, mesmoPai: a.offsetParent === parent };
      });
      expect(m.mesmoPai).toBe(true);
      expect(m.linkTop).toBeGreaterThanOrEqual(m.placeBottom); // a caixa do link (com o padding) começa depois do lugar: sem sobreposição
      // Texto simples: sem ícone, sem fundo, sem borda.
      expect(await link.locator("svg, img").count()).toBe(0);
      await expect(link).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
      const soft = await page.evaluate(() => getComputedStyle(document.querySelector(".place")!).color);
      await expect(link).toHaveCSS("color", soft);
      // Foco no padrão dos outros links: passa a --ink.
      const ink = await page.evaluate(() => getComputedStyle(document.querySelector(".place-city")!).color);
      await link.focus();
      await expect(link).toHaveCSS("color", ink);
    });

    test("o clique leva à seção Contato (endereço #contato) e o título dela aparece na tela", async ({ page }) => {
      await page.goto(r.path);
      await page.locator(".hero").getByRole("link", { name: r.contato, exact: true }).click();
      await expect(page).toHaveURL(/#contato$/);
      await expect.poll(() => page.locator("#contato").evaluate((el) => el.getBoundingClientRect().top < innerHeight), { timeout: 8000 }).toBe(true);
    });

    test("com Lenis o foco vai pra seção Contato", async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await page.goto(r.path);
      await expect(page.locator("html")).toHaveClass(/lenis/);
      await page.locator(".hero").getByRole("link", { name: r.contato, exact: true }).click();
      await expect.poll(() => page.evaluate(() => document.activeElement?.id)).toBe("contato");
    });

    for (const vp of [
      { width: 375, height: 667 },
      { width: 390, height: 844 },
    ]) {
      test(`o título e o link cabem na primeira tela a ${vp.width}×${vp.height}`, async ({ browser }) => {
        const ctx = await browser.newContext({ viewport: vp });
        const page = await ctx.newPage();
        await page.goto(r.path);
        await page.waitForFunction(() => document.getAnimations().every((a) => a.playState !== "running" || a.effect?.getComputedTiming().iterations === Infinity)); // a entrada (translateY) acabou
        const h1 = (await page.locator("h1").boundingBox())!;
        const link = (await page.locator(".to-contact").boundingBox())!;
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

    test("o separador da hora e do clima nunca abre uma linha: quando o clima quebra, o separador fica fora do bloco", async ({ browser }) => {
      for (const width of [320, 360, 390]) {
        const ctx = await browser.newContext({ viewport: { width, height: 700 } });
        const page = await ctx.newPage();
        await page.goto(r.path);
        // Texto maior (como o zoom de 200 %) força a quebra em qualquer largura.
        for (const px of [14, 28]) {
          await page.addStyleTag({ content: `.place-now{font-size:${px}px}` });
          const m = await page.evaluate(() => {
            const now = document.querySelector(".place-now")!.getBoundingClientRect();
            const t = document.querySelector(".place-time")!.getBoundingClientRect();
            const w = document.querySelector(".place-weather")!.getBoundingClientRect();
            const s = document.querySelector(".place-sep")!.getBoundingClientRect();
            return { quebrou: w.top > t.top + t.height / 2, noInicio: s.right <= now.left + 0.5, depoisDaHora: s.left >= t.right - 0.5 };
          });
          if (m.quebrou) expect(m.noInicio, `${width}px, fonte ${px}`).toBe(true);
          else expect(m.depoisDaHora, `${width}px, fonte ${px}`).toBe(true);
        }
        await ctx.close();
      }
    });

    test("o mapa não mostra a ponta da África: o recorte corta antes de 17,5° O e o pino fica de fora do corte", async ({ page }) => {
      await page.goto(r.path);
      const svg = page.locator(".place-art svg");
      const direita = await svg.evaluate((el) => parseFloat(getComputedStyle(el).clipPath.match(/[\d.]+%/g)?.[0] ?? "0"));
      expect(direita).toBeGreaterThan(0);
      // Recorte de −100° a 20° de longitude: o visível vai até (1 − direita/100); Dacar (−17,5°) fica em 82,5 / 120 = 68,75 %.
      expect(1 - direita / 100).toBeLessThan(82.5 / 120);
      const pino = (await page.locator(".place-pin").boundingBox())!;
      const mapa = (await page.locator(".place-art").boundingBox())!;
      expect(pino.x + pino.width - mapa.x).toBeLessThan(mapa.width * (1 - direita / 100));
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
