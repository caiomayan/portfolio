import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "./base";
import { rotasTexto, type RotaTexto } from "./textos";

// Issue #39, rodada 4: (1) transição da primeira tela para o resto, duas variantes de PRÉVIA por `?transicao=` (recuo = padrão, folha); (2) brilho cinza
// (Animated Shiny Text, Magic UI) no trecho "engenharia de IA" da frase de abertura. A abertura da assinatura e a passada de brilho dela ficam em abertura.spec.ts.
const TRECHO: Record<RotaTexto, string> = { "/": "engenharia de IA", "/en": "AI engineering", "/es": "ingeniería de IA" };

const rolarAte = async (page: Page, y: number, espera = 1500) => {
  await page.evaluate((v) => window.scrollTo(0, v), y);
  await page.waitForTimeout(espera);
};
const armada = (page: Page) => expect(page.locator("html")).toHaveAttribute("data-choreography", "armed", { timeout: 8000 });
const estadoHero = (page: Page) =>
  page.locator(".hero").evaluate((el) => {
    const m = getComputedStyle(el).transform;
    const escala = m === "none" ? 1 : new DOMMatrixReadOnly(m).a;
    const y = m === "none" ? 0 : new DOMMatrixReadOnly(m).m42;
    return { opacity: Number(getComputedStyle(el).opacity), escala, y, pos: getComputedStyle(el).position, top: Math.round(el.getBoundingClientRect().top) };
  });
const alturaDaPagina = (page: Page) => page.evaluate(() => document.documentElement.scrollHeight);

test.describe("brilho no trecho da frase de abertura (Magic UI)", () => {
  for (const rota of ["/", "/en", "/es"] as RotaTexto[]) {
    test(`${rota}: só o trecho marcado brilha, o texto da frase não muda e vem do copy deck`, async ({ page }) => {
      await page.goto(rota);
      const lead = page.locator(".lead");
      expect(await lead.innerText()).toBe(rotasTexto[rota].lead);
      // O brilho é uma camada por cima (aria-hidden, sem texto no DOM, o texto sai de data-t por CSS content): o <p> não ganha <span> (isso estragava o LCP no celular).
      const trecho = page.locator(".lead-wrap > .lead-glare .lead-shine");
      await expect(trecho).toHaveCount(1);
      await expect(trecho).toHaveAttribute("data-t", TRECHO[rota]);
      expect(await trecho.evaluate((el) => el.textContent)).toBe("");
      await expect(page.locator(".lead-glare")).toHaveAttribute("aria-hidden", "true");
      expect(await lead.evaluate((el) => el.childNodes.length)).toBe(1); // o <p> é só o texto inteiro, sem nenhum elemento dentro
      // A camada quebra nas mesmas linhas da frase: mesma caixa (depois da entrada `rise` da frase, que a desloca uns px).
      await page.waitForTimeout(1300);
      const caixas = await page.evaluate(() => { const a = document.querySelector(".lead")!.getBoundingClientRect(); const b = document.querySelector(".lead-glare")!.getBoundingClientRect(); return [a.x, a.y, a.width, a.height, b.x, b.y, b.width, b.height].map(Math.round); });
      expect(caixas.slice(0, 4)).toEqual(caixas.slice(4));
      // O trecho aparece uma vez só na frase (a marcação é por conteúdo, em content/).
      expect(rotasTexto[rota].lead.split(TRECHO[rota]).length - 1).toBe(1);
      // A descrição da página e a prévia seguem com a frase inteira, sem marcação.
      await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", new RegExp(rotasTexto[rota].lead.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    });
  }

  test("a animação é a do Magic UI adaptada: background-position, uma passada lenta e intervalo longo, sem loop curto", async ({ page }) => {
    await page.goto("/");
    const a = await page.locator(".lead-shine").evaluate((el) => {
      const anim = el.getAnimations().find((x) => (x as CSSAnimation).animationName === "shiny-text")!;
      const t = anim.effect!.getTiming();
      const kf = (anim.effect as KeyframeEffect).getKeyframes();
      const s = getComputedStyle(el);
      return { dur: Number(t.duration), it: t.iterations, props: [...new Set(kf.flatMap((k) => Object.keys(k)))], clip: s.webkitBackgroundClip || s.backgroundClip, fill: s.webkitTextFillColor };
    });
    expect(a.dur).toBeGreaterThanOrEqual(8000); // intervalo longo entre as passadas
    expect(a.it).toBe(Infinity);
    expect(a.props.filter((p) => !["offset", "easing", "composite", "computedOffset", "backgroundPositionX", "backgroundPositionY"].includes(p))).toEqual([]);
    expect(a.props).toContain("backgroundPositionX");
    expect(a.clip).toBe("text");
    expect(a.fill).toBe("rgba(0, 0, 0, 0)"); // preenchimento transparente: o fundo recortado pinta o texto
  });

  for (const tema of ["light", "dark"] as const) {
    test(`contraste AA no tema ${tema} durante todo o ciclo (axe com a passada no começo, no meio e no fim)`, async ({ page }) => {
      await page.addInitScript((t) => localStorage.setItem("theme", t), tema);
      await page.goto("/");
      await page.waitForTimeout(1600); // as entradas da primeira tela (`rise`) terminam: o axe mede o contraste do que está pronto
      for (const fracao of [0.02, 0.14, 0.27]) {
        await page.evaluate((f) => {
          const a = document.querySelector(".lead-shine")!.getAnimations().find((x) => (x as CSSAnimation).animationName === "shiny-text")!;
          a.pause();
          a.currentTime = 1200 + 9000 * f; // 1,2 s de atraso inicial + a fração do ciclo
        }, fracao);
        const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
        expect(violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`), `fração ${fracao}`).toEqual([]);
      }
    });
  }

  test("com prefers-reduced-motion não há brilho: a camada some e a frase é o texto de sempre", async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: "reduce" });
    const page = await ctx.newPage();
    await page.goto("/");
    const s = await page.locator(".lead-shine").evaluate((el) => ({ n: el.getAnimations().length, vis: getComputedStyle(el.parentElement!).display }));
    expect(s.n).toBe(0);
    expect(s.vis).toBe("none"); // a camada nem existe: a frase é só o texto de sempre
    await ctx.close();
  });

});

test.describe("transição da primeira tela: recuo (padrão)", () => {
  for (const [w, h] of [[1920, 1080], [1440, 900]] as const) {
    test(`${w}×${h}: a primeira tela recua como um bloco ao sair, para, e volta ao normal ao rolar de volta`, async ({ page }) => {
      await page.setViewportSize({ width: w, height: h });
      await page.goto("/");
      await armada(page);
      await expect(page.locator("html")).not.toHaveAttribute("data-transicao", /.*/);
      let e = await estadoHero(page);
      expect(e).toMatchObject({ opacity: 1, escala: 1, y: 0 }); // no topo é exatamente a identidade
      const fim = await page.locator(".hero").evaluate((el) => el.getBoundingClientRect().bottom + window.scrollY);
      await rolarAte(page, fim * 0.5);
      e = await estadoHero(page);
      expect(e.escala).toBeLessThan(0.99);
      expect(e.escala).toBeGreaterThan(0.94);
      expect(e.opacity).toBeLessThan(1);
      expect(e.opacity).toBeGreaterThan(0.05);
      await rolarAte(page, fim + 40);
      e = await estadoHero(page);
      expect(e.opacity).toBeLessThan(0.02);
      expect(e.escala).toBeCloseTo(0.94, 2);
      expect(e.y).toBeGreaterThan(40);
      expect(e.y).toBeLessThanOrEqual(48.5);
      // Parou: rolar mais não muda mais nada.
      await rolarAte(page, fim + 600, 800);
      expect(await estadoHero(page)).toMatchObject({ opacity: e.opacity, escala: e.escala });
      await rolarAte(page, 0);
      expect(await estadoHero(page)).toMatchObject({ opacity: 1, escala: 1, y: 0 });
    });
  }

  test("só transform e opacity no estilo da primeira tela, e o Carmine vem logo depois sem sobreposição", async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto("/");
    await armada(page);
    const r = await page.evaluate(() => ({ hero: document.querySelector(".hero")!.getBoundingClientRect().bottom + scrollY, carmine: document.querySelector("#carmine")!.getBoundingClientRect().top + scrollY }));
    await rolarAte(page, 300);
    const props = await page.locator(".hero").evaluate((el) => [...Array(el.style.length).keys()].map((i) => el.style[i]));
    expect(props.filter((p) => !["opacity", "transform", "transform-origin", "translate", "scale", "rotate"].includes(p))).toEqual([]);
    expect(r.carmine).toBeGreaterThanOrEqual(r.hero - 1); // sem sobreposição no fluxo: o vão natural da primeira tela é mantido
  });

  test("no celular (toque) é mais leve: recua pouco e não some por inteiro", async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width: 375, height: 667 }, hasTouch: true, isMobile: true });
    const page = await ctx.newPage();
    await page.goto("/");
    await armada(page);
    const fim = await page.locator(".hero").evaluate((el) => el.getBoundingClientRect().bottom + window.scrollY);
    await rolarAte(page, fim + 40, 800);
    const e = await estadoHero(page);
    expect(e.escala).toBeGreaterThanOrEqual(0.97 - 0.005);
    expect(e.opacity).toBeGreaterThanOrEqual(0.19);
    expect(e.y).toBeLessThanOrEqual(16.5);
    await ctx.close();
  });

  test("com prefers-reduced-motion a primeira tela fica estática", async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: "reduce", viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    await page.goto("/");
    await page.waitForTimeout(1500);
    await rolarAte(page, 500, 600);
    expect(await estadoHero(page)).toMatchObject({ opacity: 1, escala: 1, y: 0 });
    await ctx.close();
  });
});

test.describe("transição da primeira tela: folha (?transicao=folha)", () => {
  for (const [w, h] of [[1920, 1080], [1440, 900]] as const) {
    test(`${w}×${h}: a primeira tela fica presa por uma tela só e a folha sobe por cima, com a primeira tela recuando por baixo`, async ({ page }) => {
      await page.setViewportSize({ width: w, height: h });
      await page.goto("/?transicao=folha");
      await armada(page);
      await expect(page.locator("html")).toHaveAttribute("data-transicao", "folha");
      let e = await estadoHero(page);
      expect(e).toMatchObject({ pos: "sticky", opacity: 1, escala: 1 });
      const heroH = await page.locator(".hero").evaluate((el) => el.getBoundingClientRect().height);
      // Presa: depois de rolar, o topo da primeira tela fica em 0 enquanto a folha sobe.
      await rolarAte(page, 122 + heroH * 0.5);
      e = await estadoHero(page);
      expect(Math.abs(e.top - heroH * 0.4 * (1 - e.escala))).toBeLessThanOrEqual(1.5); // presa em 0 (o recuo, a 50 % 40 %, só a desloca pelo que escalou)
      expect(e.escala).toBeLessThan(1);
      expect(e.opacity).toBeLessThan(1);
      const folha = await page.locator(".rest").evaluate((el) => { const s = getComputedStyle(el); return { top: Math.round(el.getBoundingClientRect().top), raio: s.borderTopLeftRadius, bg: s.backgroundColor, sombra: s.boxShadow }; });
      expect(folha.raio).toBe("24px");
      expect(folha.top).toBeGreaterThan(0);
      expect(folha.sombra).not.toBe("none");
      // A folha cobriu a primeira tela: o recuo termina, e depois de uma tela ela se solta e vai embora.
      await rolarAte(page, 122 + heroH + 200);
      e = await estadoHero(page);
      expect(e.opacity).toBeCloseTo(0.25, 1);
      expect(e.escala).toBeCloseTo(0.95, 2);
      await rolarAte(page, 122 + heroH + h * 1.0 + 400, 800);
      e = await estadoHero(page);
      expect(e.top).toBeLessThan(0); // solta: não fica presa pela página inteira
      await rolarAte(page, 0);
      expect(await estadoHero(page)).toMatchObject({ opacity: 1, escala: 1 });
    });
  }

  test("a altura da página é a mesma nas duas variantes (nada de rolagem a mais) e o <html> não ganha rolagem lateral", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    const a = await alturaDaPagina(page);
    await page.goto("/?transicao=folha");
    expect(Math.abs((await alturaDaPagina(page)) - a)).toBeLessThanOrEqual(40); // só o respiro de cima da folha
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });

  test("a âncora continua valendo: /?transicao=folha#carmine leva ao título do Carmine, sem ficar sob a folha", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/?transicao=folha#carmine");
    await page.waitForTimeout(1200);
    const topo = await page.locator("#carmine h2").evaluate((el) => el.getBoundingClientRect().top);
    expect(topo).toBeGreaterThanOrEqual(0);
    expect(topo).toBeLessThan(500);
    await expect(page.locator("#carmine h2")).toBeInViewport();
  });

  test("a cápsula flutuante (idioma e tema) continua aparecendo ao rolar e fica acima da folha", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/?transicao=folha");
    await rolarAte(page, 900, 800);
    await expect(page.locator(".top-actions")).toHaveAttribute("data-floating", "true");
    const z = await page.evaluate(() => ({ cap: Number(getComputedStyle(document.querySelector(".top-actions")!).zIndex), rest: Number(getComputedStyle(document.querySelector(".rest")!).zIndex) }));
    expect(z.cap).toBeGreaterThan(z.rest);
    const ponto = await page.locator(".top-actions button").first().evaluate((el) => { const r = el.getBoundingClientRect(); return document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2)?.closest(".top-actions") !== null; });
    expect(ponto).toBe(true);
  });

  test("no celular e em janelas baixas a folha não prende a primeira tela (ela não é de tela cheia)", async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width: 375, height: 667 }, hasTouch: true, isMobile: true });
    const page = await ctx.newPage();
    await page.goto("/?transicao=folha");
    expect((await estadoHero(page)).pos).not.toBe("sticky");
    await ctx.close();
    const baixa = await browser.newContext({ viewport: { width: 1280, height: 640 } });
    const p2 = await baixa.newPage();
    await p2.goto("/?transicao=folha");
    expect((await estadoHero(p2)).pos).not.toBe("sticky");
    await baixa.close();
  });

  test("com prefers-reduced-motion não há folha presa nem recuo: tudo estático", async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: "reduce", viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    await page.goto("/?transicao=folha");
    expect((await estadoHero(page)).pos).not.toBe("sticky");
    await rolarAte(page, 500, 600);
    expect(await estadoHero(page)).toMatchObject({ opacity: 1, escala: 1 });
    await ctx.close();
  });

  test("a escolha sobrevive à troca de idioma, a rolagem fica e a transição é refeita no conteúdo novo", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/?transicao=folha");
    await armada(page);
    await rolarAte(page, 300, 800);
    const y = await page.evaluate(() => window.scrollY);
    await page.getByRole("button", { name: /^Idioma/ }).click();
    await page.getByRole("menuitemradio", { name: "English" }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Software Engineer");
    await expect(page.locator("html")).toHaveAttribute("data-transicao", "folha");
    await page.waitForTimeout(1500);
    expect(Math.abs((await page.evaluate(() => window.scrollY)) - y)).toBeLessThan(120);
    await rolarAte(page, 700);
    const e = await estadoHero(page);
    expect(e.pos).toBe("sticky");
    expect(e.opacity).toBeLessThan(1); // a transição voltou a valer depois da troca
    await rolarAte(page, 0);
    expect(await estadoHero(page)).toMatchObject({ opacity: 1, escala: 1 });
  });
});

test.describe("indicador de rolagem no fim da primeira tela", () => {
  test("aparece em telas altas (1440×900 e 1920×1080), anda sem movimento reduzido e some ao começar a rolar", async ({ page }) => {
    for (const [w, h] of [[1440, 900], [1920, 1080]] as const) {
      await page.setViewportSize({ width: w, height: h });
      await page.goto("/");
      const cue = page.locator(".scroll-cue");
      await expect(cue).toBeVisible();
      await expect(cue).toHaveAttribute("aria-hidden", "true");
      expect((await cue.textContent())?.trim()).toBe(""); // sem texto: não precisa de tradução
      expect(await page.locator(".scroll-cue-dot").evaluate((el) => el.getAnimations().length)).toBe(1);
      await rolarAte(page, 120, 500);
      await expect(cue).toBeHidden();
      await rolarAte(page, 0, 500);
      await expect(cue).toBeVisible();
    }
  });

  test("não aparece onde não há vão (1280×720) nem no celular", async ({ page, browser }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/");
    await expect(page.locator(".scroll-cue")).toBeHidden();
    const ctx = await browser.newContext({ viewport: { width: 375, height: 667 }, hasTouch: true, isMobile: true });
    const p2 = await ctx.newPage();
    await p2.goto("/");
    await expect(p2.locator(".scroll-cue")).toBeHidden();
    await ctx.close();
  });

  test("com prefers-reduced-motion o ponto fica parado", async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: "reduce", viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    await page.goto("/");
    expect(await page.locator(".scroll-cue-dot").evaluate((el) => el.getAnimations().length)).toBe(0);
    await ctx.close();
  });
});
