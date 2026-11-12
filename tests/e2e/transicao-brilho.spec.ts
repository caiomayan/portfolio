import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "./base";
import { rotasTexto, type RotaTexto } from "./textos";

// Issue #39, rodadas 4 e 5: (1) a folha: a primeira tela inteira fica travada e o resto sobe por cima (o recuo e o `?transicao=` da prévia saíram); (2) brilho cinza
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

test.describe("a folha: a primeira tela inteira fica travada e só a folha se move (#39, rodada 5)", () => {
  /** O que tem que ficar imóvel: o topo (assinatura e controles) e a primeira tela (sem o recuo). */
  const imovel = (page: Page) =>
    page.evaluate(() => {
      const r = (s: string) => { const b = document.querySelector(s)!.getBoundingClientRect(); return [Math.round(b.x * 10) / 10, Math.round(b.y * 10) / 10, Math.round(b.width * 10) / 10, Math.round(b.height * 10) / 10].join(","); };
      // A primeira tela é lida sem o recuo (o scrub de escala mexe no retângulo): limpa o transform só durante a leitura.
      const hero = document.querySelector(".hero") as HTMLElement;
      hero.style.setProperty("transform", "none", "important");
      const heroRect = r(".hero");
      hero.style.removeProperty("transform");
      return { assinatura: r(".top .signature-mark"), controles: r(".top-actions"), hero: heroRect };
    });

  for (const [w, h] of [[1920, 1080], [1440, 900]] as const) {
    test(`${w}×${h}: do primeiro pixel até a folha cobrir, o topo e a primeira tela não saem do lugar; a folha sobe e a primeira tela recua por baixo`, async ({ page }) => {
      await page.setViewportSize({ width: w, height: h });
      await page.goto("/");
      await armada(page);
      let e = await estadoHero(page);
      expect(e).toMatchObject({ pos: "sticky", opacity: 1, escala: 1 });
      const base = await imovel(page);
      expect(await page.locator(".top").evaluate((el) => getComputedStyle(el).position)).toBe("sticky");
      for (const y of [120, h * 0.35, h * 0.7, h - 120]) {
        await rolarAte(page, y, 900);
        expect(await imovel(page), `rolado ${Math.round(y)} px: o topo e a primeira tela não podem se mover`).toEqual(base);
        const folha = await page.locator(".rest").evaluate((el) => Math.round(el.getBoundingClientRect().top));
        expect(folha).toBeGreaterThan(0); // só a folha sobe: ainda não cobriu tudo
      }
      // O recuo por baixo (o esmaecimento de que o Caio gostou): escala e opacidade presas à rolagem.
      await rolarAte(page, h * 0.5, 900);
      e = await estadoHero(page);
      expect(e.escala).toBeLessThan(1);
      expect(e.escala).toBeGreaterThan(0.95);
      expect(e.opacity).toBeLessThan(1);
      expect(e.opacity).toBeGreaterThan(0.25);
      const folha = await page.locator(".rest").evaluate((el) => { const s = getComputedStyle(el); return { raio: s.borderTopLeftRadius, sombra: s.boxShadow, bg: s.backgroundColor }; });
      expect(folha.raio).toBe("24px");
      expect(folha.sombra).not.toBe("none");
      // A folha cobriu tudo: o recuo termina e, depois de mais alguma rolagem, a primeira tela se solta e vai embora.
      await rolarAte(page, h + 60, 900);
      e = await estadoHero(page);
      expect(e.opacity).toBeCloseTo(0.25, 1);
      expect(e.escala).toBeCloseTo(0.95, 2);
      await rolarAte(page, h * 2 + 400, 900);
      expect((await estadoHero(page)).top).toBeLessThan(0);
      await rolarAte(page, 0);
      expect(await estadoHero(page)).toMatchObject({ opacity: 1, escala: 1 });
      expect(await imovel(page)).toEqual(base);
    });
  }

  test("a cápsula entra só quando a folha cobre os controles, e nunca há dois conjuntos de controles à vista", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await armada(page);
    const caps = page.locator(".top-actions");
    await rolarAte(page, 600, 800);
    await expect(caps).not.toHaveAttribute("data-floating", "true"); // os controles do topo seguem à vista (ainda sem folha por cima)
    await rolarAte(page, 900 + 40, 900);
    await expect(caps).toHaveAttribute("data-floating", "true");
    const r = await page.evaluate(() => ({
      cap: getComputedStyle(document.querySelector(".top-actions")!).position,
      topoZ: Number(getComputedStyle(document.querySelector(".top")!).zIndex),
      restZ: Number(getComputedStyle(document.querySelector(".rest")!).zIndex),
      assinatura: getComputedStyle(document.querySelector(".top .signature-mark")!).visibility,
      controles: document.querySelectorAll(".top-actions").length, // uma cópia só no DOM
    }));
    expect(r).toMatchObject({ cap: "fixed", assinatura: "hidden", controles: 1 });
    expect(r.topoZ).toBeGreaterThan(r.restZ);
    const ponto = await caps.locator("button").first().evaluate((el) => { const b = el.getBoundingClientRect(); return document.elementFromPoint(b.x + b.width / 2, b.y + b.height / 2)?.closest(".top-actions") !== null; });
    expect(ponto).toBe(true);
    // O topo (sem a cápsula) não rouba os cliques da folha: o que está debaixo do canto superior esquerdo não é o cabeçalho.
    const sobre = await page.evaluate(() => document.elementFromPoint(200, 40)?.closest("header") === null);
    expect(sobre).toBe(true);
    await rolarAte(page, 300, 900);
    await expect(caps).not.toHaveAttribute("data-floating", "true"); // a folha desceu: a cápsula volta pro topo
  });

  test("a altura da página é a mesma sem a folha (nada de rolagem a mais) e o <html> não ganha rolagem lateral", async ({ page, browser }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    const com = await alturaDaPagina(page);
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
    const p2 = await ctx.newPage();
    await p2.goto("/");
    expect(Math.abs(com - (await alturaDaPagina(p2)))).toBeLessThanOrEqual(40); // só o respiro de cima da folha
    await ctx.close();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });

  test("a âncora continua valendo: /#carmine leva ao título do Carmine, sem ficar sob a folha", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/#carmine");
    await page.waitForTimeout(1200);
    const topo = await page.locator("#carmine h2").evaluate((el) => el.getBoundingClientRect().top);
    expect(topo).toBeGreaterThanOrEqual(0);
    expect(topo).toBeLessThan(500);
    await expect(page.locator("#carmine h2")).toBeInViewport();
    await expect(page.locator(".top-actions")).toHaveAttribute("data-floating", "true");
  });

  test("o parâmetro ?transicao= não existe mais: a folha é o comportamento único", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    for (const q of ["", "?transicao=recuo", "?transicao=folha"]) {
      await page.goto("/" + q);
      expect((await estadoHero(page)).pos).toBe("sticky");
      await expect(page.locator("html")).not.toHaveAttribute("data-transicao", /.*/);
    }
  });

  test("no celular e em janelas baixas nada é travado (a primeira tela não é de tela cheia)", async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width: 375, height: 667 }, hasTouch: true, isMobile: true });
    const page = await ctx.newPage();
    await page.goto("/");
    expect((await estadoHero(page)).pos).not.toBe("sticky");
    expect(await page.locator(".top").evaluate((el) => getComputedStyle(el).position)).not.toBe("sticky");
    await ctx.close();
    const baixa = await browser.newContext({ viewport: { width: 1280, height: 640 } });
    const p2 = await baixa.newPage();
    await p2.goto("/");
    expect((await estadoHero(p2)).pos).not.toBe("sticky");
    await baixa.close();
  });

  test("com prefers-reduced-motion não há folha presa nem recuo: tudo estático", async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: "reduce", viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    await page.goto("/");
    expect((await estadoHero(page)).pos).not.toBe("sticky");
    expect(await page.locator(".top").evaluate((el) => getComputedStyle(el).position)).not.toBe("sticky");
    await rolarAte(page, 500, 600);
    expect(await estadoHero(page)).toMatchObject({ opacity: 1, escala: 1 });
    await ctx.close();
  });

  test("a troca de idioma mantém a rolagem e a folha é refeita no conteúdo novo", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await armada(page);
    await rolarAte(page, 300, 800);
    const y = await page.evaluate(() => window.scrollY);
    await page.getByRole("button", { name: /^Idioma/ }).click();
    await page.getByRole("menuitemradio", { name: "English" }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Software Engineer");
    await page.waitForTimeout(1500);
    expect(Math.abs((await page.evaluate(() => window.scrollY)) - y)).toBeLessThan(120);
    await rolarAte(page, 700);
    const e = await estadoHero(page);
    expect(e.pos).toBe("sticky");
    expect(e.opacity).toBeLessThan(1); // o recuo voltou a valer depois da troca
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
