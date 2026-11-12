import { assentar, expect, test } from "./base";

// Issue #29, acabamento: medida de leitura, stack do Carmine mais leve, mapa maior no desktop e Fundamentos em três grupos (#29).
for (const path of ["/", "/en", "/es"]) {
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
      const rotulo = { "/": "Feito com", "/en": "Built with", "/es": "Hecho con" }[path]!;
      await expect(page.locator("#carmine .icon-row-label")).toHaveText(rotulo);
      await assentar(page, "#carmine .stack img");
      const img = await page.locator("#carmine .stack img").first().evaluate((el) => ({ w: el.getBoundingClientRect().width, o: getComputedStyle(el).opacity }));
      expect(img.w).toBe(16);
      expect(Number(img.o)).toBeLessThan(1);
      expect(await page.locator("#carmine .stack img.color").evaluate((el) => getComputedStyle(el).filter)).toContain("brightness(0)");
    });

    test("mapa da primeira tela: tem a altura da faixa de baixo (96 px no desktop, 72 no celular) e a largura vem do recorte (#36)", async ({ browser }) => {
      for (const [w, h, altura] of [[1440, 900, 96], [390, 844, 72]] as const) {
        const ctx = await browser.newContext({ viewport: { width: w, height: h } });
        const p = await ctx.newPage();
        await p.goto(path);
        const box = (await p.locator(".place-art").boundingBox())!;
        expect(Math.abs(box.height - altura), `${w}px: altura`).toBeLessThanOrEqual(1);
        const [vbW, vbH] = await p.locator(".place-art svg").evaluate((el) => el.getAttribute("viewBox")!.split(" ").slice(2).map(Number));
        expect(box.width / box.height, `${w}px: proporção do recorte`).toBeCloseTo(vbW / vbH, 1);
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

    test("Fundamentos: três grupos lado a lado no desktop, empilhados no celular", async ({ browser }) => {
      const grupos = async (w: number) => {
        const ctx = await browser.newContext({ viewport: { width: w, height: 800 } });
        const p = await ctx.newPage();
        await p.goto(path);
        const boxes = await p.locator("#fundamentos .foundation-group").evaluateAll((els) => els.map((e) => { const r = e.getBoundingClientRect(); return { left: Math.round(r.left), top: Math.round(r.top) }; }));
        const scroll = await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
        await ctx.close();
        return { boxes, scroll };
      };
      for (const w of [375, 390]) {
        const r = await grupos(w);
        expect(new Set(r.boxes.map((b) => b.left)).size, `${w}px`).toBe(1);
        expect(new Set(r.boxes.map((b) => b.top)).size, `${w}px`).toBe(3);
        expect(r.scroll).toBe(true);
      }
      const d = await grupos(1440);
      expect(d.boxes).toHaveLength(3);
      expect(new Set(d.boxes.map((b) => b.left)).size).toBe(3);
      expect(new Set(d.boxes.map((b) => b.top)).size).toBe(1);
      expect(d.scroll).toBe(true);
    });
  });
}
