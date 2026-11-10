import { expect, test } from "@playwright/test";

// Issue #29, acabamento: medida de leitura, stack do Carmine mais leve, mapa maior no desktop e Fundamentos em duas colunas (#29).
for (const path of ["/", "/en"]) {
  test.describe(`acabamento em ${path}`, () => {
    test("textos de apoio ficam numa medida de leitura (até 75 caracteres), o período segue à direita", async ({ browser }) => {
      const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
      const page = await ctx.newPage();
      await page.goto(path);
      const larguras = await page.evaluate(() => {
        const c = document.createElement("canvas").getContext("2d")!;
        const sel = "#experiencia .entry-sub, #experiencia .entry-lines li, #formacao .entry-sub, #carmine .carmine-body p";
        return [...document.querySelectorAll<HTMLElement>(sel)].map((el) => {
          const cs = getComputedStyle(el);
          c.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
          return { texto: el.textContent!.slice(0, 30), ch: el.getBoundingClientRect().width / c.measureText("0").width };
        });
      });
      expect(larguras.length).toBeGreaterThan(6);
      for (const l of larguras) expect(l.ch, l.texto).toBeLessThanOrEqual(80);
      // O período fica alinhado à direita da linha (borda direita da coluna), longe do texto limitado.
      const periodo = (await page.locator("#experiencia .entry-period").first().boundingBox())!;
      const entrada = (await page.locator("#experiencia .entry").first().boundingBox())!;
      expect(Math.abs(periodo.x + periodo.width - (entrada.x + entrada.width))).toBeLessThan(2);
      await ctx.close();
    });

    test("a linha de ícones é discreta: 16 px, tom suave, rótulo Feito com; o Valkey perde a cor", async ({ page }) => {
      await page.goto(path);
      const rotulo = path === "/" ? "Feito com" : "Built with";
      await expect(page.locator("#carmine .icon-row-label")).toHaveText(rotulo);
      const img = await page.locator("#carmine .stack img").first().evaluate((el) => ({ w: el.getBoundingClientRect().width, o: getComputedStyle(el).opacity }));
      expect(img.w).toBe(16);
      expect(Number(img.o)).toBeLessThan(1);
      expect(await page.locator("#carmine .stack img.color").evaluate((el) => getComputedStyle(el).filter)).toContain("brightness(0)");
    });

    test("mapa da primeira tela: maior no desktop (216 px), compacto no celular", async ({ browser }) => {
      for (const [w, h, min, max] of [[1440, 900, 210, 220], [390, 844, 100, 144]] as const) {
        const ctx = await browser.newContext({ viewport: { width: w, height: h } });
        const p = await ctx.newPage();
        await p.goto(path);
        const box = (await p.locator(".place-art").boundingBox())!;
        expect(box.width, `${w}px`).toBeGreaterThanOrEqual(min);
        expect(box.width, `${w}px`).toBeLessThanOrEqual(max);
        await ctx.close();
      }
    });

    test("título acima da dobra a 390×844 e 375×667, sem rolagem lateral", async ({ browser }) => {
      for (const [w, h] of [[390, 844], [375, 667]] as const) {
        const ctx = await browser.newContext({ viewport: { width: w, height: h } });
        const p = await ctx.newPage();
        await p.goto(path);
        const h1 = (await p.locator("h1").boundingBox())!;
        expect(h1.y + h1.height, `${w}x${h}`).toBeLessThanOrEqual(h);
        expect(await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
        await ctx.close();
      }
    });

    test("Fundamentos: duas colunas no desktop (5 + 4, lidas de cima pra baixo), uma no celular", async ({ browser }) => {
      const colunas = async (w: number) => {
        const ctx = await browser.newContext({ viewport: { width: w, height: 800 } });
        const p = await ctx.newPage();
        await p.goto(path);
        const lefts = await p.locator("#fundamentos .foundations li").evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().left)));
        const tops = await p.locator("#fundamentos .foundations li").evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().top)));
        const scroll = await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
        await ctx.close();
        return { lefts, tops, scroll };
      };
      for (const w of [375, 390]) {
        const r = await colunas(w);
        expect(new Set(r.lefts).size, `${w}px`).toBe(1);
        expect(r.scroll).toBe(true);
      }
      const d = await colunas(1440);
      expect(new Set(d.lefts).size).toBe(2);
      expect(d.lefts.slice(0, 5).every((l) => l === d.lefts[0])).toBe(true);
      expect(d.lefts.slice(5).every((l) => l === d.lefts[5])).toBe(true);
      expect(d.tops[5]).toBe(d.tops[0]); // a segunda coluna começa na altura da primeira
      expect(d.scroll).toBe(true);
    });
  });
}
