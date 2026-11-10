import { expect, test } from "@playwright/test";

// Primeira tela em moldura (#36): foto e título alinhados no meio, faixa de lugar e Contato presa à base.
// Movimento reduzido: a entrada (`rise`, translateY) não desloca as caixas durante a medida.
const rotas = ["/", "/en"];

/** Mede, no navegador, o topo das maiúsculas do h1 e a linha de base da última linha da frase (com as métricas da fonte), e as caixas da foto e da faixa. */
async function medir(page: import("@playwright/test").Page) {
  await page.evaluate(() => document.fonts.ready);
  return page.evaluate(() => {
    const box = (s: string) => document.querySelector(s)!.getBoundingClientRect();
    const ctx = document.createElement("canvas").getContext("2d")!;
    const metricas = (el: Element, amostra: string) => {
      const cs = getComputedStyle(el);
      ctx.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      const m = ctx.measureText(amostra);
      return { asc: m.fontBoundingBoxAscent, desc: m.fontBoundingBoxDescent, cap: m.actualBoundingBoxAscent, lh: parseFloat(cs.lineHeight) };
    };
    const h1 = document.querySelector("h1")!;
    const lead = document.querySelector(".lead")!;
    const a = metricas(h1, "E");
    const b = metricas(lead, "x");
    const topoMaiusculas = box("h1").top + (a.lh - (a.asc + a.desc)) / 2 + a.asc - a.cap;
    const baseFrase = box(".lead").bottom - (b.lh - (b.asc + b.desc)) / 2 - b.desc;
    const photo = box(".photo");
    const hero = box(".hero");
    const strip = box(".hero-strip");
    const main = box(".hero-main");
    return {
      fotoTopo: photo.top, fotoBase: photo.bottom, topoMaiusculas, baseFrase,
      heroBase: hero.bottom, faixaTopo: strip.top, faixaBase: strip.bottom, meioBase: main.bottom,
      janela: innerHeight, largura: document.documentElement.scrollWidth, vw: innerWidth,
    };
  });
}

for (const path of rotas) {
  test.describe(`primeira tela em moldura em ${path}`, () => {
    for (const [w, h] of [[1920, 900], [1440, 900]] as const) {
      test(`${w}×${h}: o topo da foto bate com o topo das maiúsculas do título, a base com o fim da frase, e a faixa está presa à base`, async ({ browser }) => {
        const ctx = await browser.newContext({ viewport: { width: w, height: h }, reducedMotion: "reduce" });
        const page = await ctx.newPage();
        await page.goto(path);
        const m = await medir(page);
        expect(Math.abs(m.fotoTopo - m.topoMaiusculas), "topo").toBeLessThanOrEqual(4);
        expect(Math.abs(m.fotoBase - m.baseFrase), "base").toBeLessThanOrEqual(4);
        // A faixa fica na borda de baixo da primeira tela (que tem a altura cheia da janela).
        expect(Math.abs(m.heroBase - m.janela)).toBeLessThanOrEqual(1);
        expect(m.heroBase - m.faixaBase).toBeLessThanOrEqual(24);
        expect(m.largura).toBeLessThanOrEqual(m.vw);
        await ctx.close();
      });
    }

    test("a foto e o título ficam lado a lado e o conjunto fica centrado entre o topo e a faixa", async ({ browser }) => {
      const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
      const page = await ctx.newPage();
      await page.goto(path);
      const m = await page.evaluate(() => {
        const box = (s: string) => document.querySelector(s)!.getBoundingClientRect();
        const header = box(".top");
        return { fotoDir: box(".photo").right, tituloEsq: box("h1").left, acima: box(".photo").top - header.bottom, abaixo: box(".hero-strip").top - box(".photo").bottom };
      });
      expect(m.tituloEsq).toBeGreaterThan(m.fotoDir);
      expect(Math.abs(m.acima - m.abaixo)).toBeLessThanOrEqual(4);
      await ctx.close();
    });

    test("janelas baixas (1440×760 e 1280×720): nada se sobrepõe e a faixa continua embaixo", async ({ browser }) => {
      for (const [w, h] of [[1440, 760], [1280, 720]] as const) {
        const ctx = await browser.newContext({ viewport: { width: w, height: h }, reducedMotion: "reduce" });
        const page = await ctx.newPage();
        await page.goto(path);
        const m = await medir(page);
        const topo = await page.evaluate(() => document.querySelector(".top")!.getBoundingClientRect().bottom);
        expect(m.fotoTopo, `${w}×${h}`).toBeGreaterThanOrEqual(topo);
        expect(m.meioBase, `${w}×${h}`).toBeLessThanOrEqual(m.faixaTopo + 0.5);
        expect(m.fotoBase, `${w}×${h}`).toBeLessThanOrEqual(m.faixaTopo);
        expect(Math.abs(m.fotoTopo - m.topoMaiusculas), `${w}×${h}`).toBeLessThanOrEqual(4);
        expect(m.largura).toBeLessThanOrEqual(m.vw);
        await ctx.close();
      }
    });

    test("celular: foto, título, frase e só depois a faixa; o lugar e o Contato ficam na faixa, sem rolagem lateral a 320 px", async ({ browser }) => {
      for (const [w, h] of [[375, 667], [320, 640]] as const) {
        const ctx = await browser.newContext({ viewport: { width: w, height: h }, reducedMotion: "reduce" });
        const page = await ctx.newPage();
        await page.goto(path);
        const m = await page.evaluate(() => {
          const box = (s: string) => document.querySelector(s)!.getBoundingClientRect();
          const linha = document.querySelector(".place-line")!;
          return {
            ordem: [box(".photo").bottom, box("h1").top, box(".lead").top, box(".hero-strip").top],
            tituloBase: box("h1").bottom,
            contatoDentro: document.querySelector(".hero-strip")!.contains(document.querySelector(".to-contact")),
            contatoAbaixoDoLugar: box(".to-contact").top >= box(".place").bottom - 12 || box(".to-contact").left >= box(".place").right,
            contatoDir: box(".to-contact").right,
            stripDir: box(".hero-strip").right,
            comecaComPonto: ((): boolean => {
              const itens = [...linha.querySelectorAll<HTMLElement>(":scope > *")];
              const esq = linha.getBoundingClientRect().left;
              return itens.some((i) => {
                const s = i.querySelector(".place-sep");
                return !!s && Math.abs(i.getBoundingClientRect().left - esq) < 1 && s.getBoundingClientRect().right > esq + 0.5;
              });
            })(),
            largura: document.documentElement.scrollWidth, vw: innerWidth,
          };
        });
        expect(m.ordem, `${w}px`).toEqual([...m.ordem].sort((a, b) => a - b));
        expect(m.tituloBase, `${w}px: título acima da dobra`).toBeLessThanOrEqual(h);
        expect(m.contatoDentro).toBe(true);
        expect(m.contatoAbaixoDoLugar).toBe(true);
        expect(Math.abs(m.contatoDir - m.stripDir), "Contato na borda direita da faixa").toBeLessThanOrEqual(1);
        expect(m.comecaComPonto, "nenhuma linha começa com ·").toBe(false);
        expect(m.largura).toBeLessThanOrEqual(m.vw);
        await ctx.close();
      }
    });
  });
}
