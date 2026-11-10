import { expect, test } from "@playwright/test";

// Issue #29, acabamento: medida de leitura, stack do Carmine mais leve, mapa maior no desktop e Tecnologias sem ícone sobrando.
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

    test("a stack do Carmine é mais leve que Tecnologias: ícones de 16 px, tom suave, rótulo Feito com", async ({ page }) => {
      await page.goto(path);
      const rotulo = path === "/" ? "Feito com" : "Built with";
      await expect(page.locator("#carmine h3.label")).toHaveText(rotulo);
      const [carmine, tech] = await Promise.all([
        page.locator("#carmine .stack img").first().evaluate((el) => ({ w: el.getBoundingClientRect().width, o: getComputedStyle(el).opacity })),
        page.locator("#tecnologias .stack img").first().evaluate((el) => ({ w: el.getBoundingClientRect().width, o: getComputedStyle(el).opacity })),
      ]);
      expect(carmine.w).toBe(16);
      expect(tech.w).toBe(20);
      expect(Number(carmine.o)).toBeLessThan(Number(tech.o));
      // O logo do Valkey perde a cor (tom suave, como os outros).
      expect(await page.locator("#carmine .stack img.color").evaluate((el) => getComputedStyle(el).filter)).toContain("brightness(0)");
      expect(await page.locator("#tecnologias .stack img.color").evaluate((el) => getComputedStyle(el).filter)).toBe("none");
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

    test("Tecnologias: 5 por linha no celular (4 linhas), uma linha no desktop, nunca ícone sozinho", async ({ browser }) => {
      const linhas = async (w: number) => {
        const ctx = await browser.newContext({ viewport: { width: w, height: 800 } });
        const p = await ctx.newPage();
        await p.goto(path);
        const tops = await p.locator("#tecnologias .stack li").evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().top)));
        const lefts = await p.locator("#tecnologias .stack li").evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().left)));
        const scroll = await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
        await ctx.close();
        const porLinha = new Map<number, number>();
        for (const t of tops) porLinha.set(t, (porLinha.get(t) ?? 0) + 1);
        return { contagens: [...porLinha.values()], lefts, scroll };
      };
      for (const w of [390, 375]) {
        const r = await linhas(w);
        expect(r.contagens, `${w}px`).toEqual([5, 5, 5, 5]);
        expect(r.scroll).toBe(true);
      }
      expect((await linhas(1440)).contagens).toEqual([20]);
      expect((await linhas(1000)).contagens).toEqual([10, 10]);
    });
  });
}
