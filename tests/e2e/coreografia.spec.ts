import { expect, test, type Page } from "./base";

// Issue #39 (revisão): coreografia de cada seção com GSAP + ScrollTrigger. Presa à rolagem com suavização (assenta e para) e entradas únicas.
// Os gatilhos levam data-motion="pending" | "played"; o <html> leva data-choreography="armed" quando está preparada.
const html = (page: Page) => page.locator("html");
const armada = (page: Page) => expect(html(page)).toHaveAttribute("data-choreography", "armed", { timeout: 8000 });
const PARTES = "h2 .title-text, .carmine-body, .timeline, .entry, .entry-main, .foundation-group, .activity-week, .activity-total, .language, .site-footer, .stack li";
const opacidades = (page: Page, sel = PARTES) => page.locator(sel).evaluateAll((els) => els.map((el) => Number(getComputedStyle(el).opacity)));
const pendentes = (page: Page) => page.locator("[data-motion=pending]").count();

/** Rola a janela por degraus (rolagem nativa, sem esperar o Lenis) e dá tempo à suavização. */
async function rolarAte(page: Page, y: number, espera = 1300) {
  await page.evaluate((v) => window.scrollTo(0, v), y);
  await page.waitForTimeout(espera);
}
async function rolarTudo(page: Page) {
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y <= total; y += 400) await rolarAte(page, y, 220);
  await rolarAte(page, total, 1800);
}
const topoNoDocumento = (page: Page, sel: string) => page.locator(sel).first().evaluate((el) => Math.round(el.getBoundingClientRect().top + window.scrollY));

test.describe("coreografia das seções (#39)", () => {
  test("o GSAP não está no primeiro carregamento: o HTML não referencia o pacote, que chega depois, ocioso", async ({ page, request }) => {
    const resposta = await request.get("/");
    const doc = await resposta.text();
    const srcs = [...doc.matchAll(/<script[^>]+src="([^"]+\.js[^"]*)"/g)].map((m) => m[1]);
    expect(srcs.length).toBeGreaterThan(0);
    for (const src of srcs) {
      const js = await (await request.get(src)).text();
      expect(js, `${src} não pode conter o ScrollTrigger`).not.toContain("ScrollTrigger");
    }
    await page.goto("/");
    await armada(page); // e depois chega, por import()
  });

  test("com prefers-reduced-motion não prepara nada: tudo aparece pronto", async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: "reduce", viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    await page.goto("/");
    await page.waitForTimeout(2500);
    await expect(html(page)).not.toHaveAttribute("data-choreography", /.*/);
    expect(await pendentes(page)).toBe(0);
    expect(await opacidades(page)).not.toContain(0);
    await ctx.close();
  });

  test("preparada, o que está abaixo da tela fica escondido e cada gatilho assenta ao chegar (sem nada pendente no fim)", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await armada(page);
    expect(await pendentes(page)).toBeGreaterThan(10);
    expect(await opacidades(page, "#idiomas .language")).toEqual([0, 0]);
    await rolarTudo(page);
    await expect.poll(() => pendentes(page), { timeout: 8000 }).toBe(0);
    expect(await opacidades(page)).not.toContain(0);
    // Assentou: sem estilo inline de animação sobrando (clearProps), então o hover e o CSS voltam a valer.
    const sobras = await page.locator(PARTES).evaluateAll((els) => els.filter((el) => /opacity|transform/.test((el as HTMLElement).getAttribute("style") ?? "")).length);
    expect(sobras).toBe(0);
  });

  test("presa à rolagem: o progresso acompanha a posição; depois de assentar nada se mexe, nem ao voltar", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await armada(page);
    const topo = await topoNoDocumento(page, "#experiencia .entry");
    // Com a linha entrando pela borda de baixo (≈ 88 % da altura): parcialmente revelada, nem escondida nem pronta.
    await rolarAte(page, topo - 790);
    const meio = (await opacidades(page, "#experiencia .entry"))[0];
    expect(meio).toBeGreaterThan(0.02);
    expect(meio).toBeLessThan(0.98);
    // Mais fundo na rolagem (linha a ~35 % da altura): mais revelada, e assentou.
    await rolarAte(page, topo - 315);
    await expect.poll(async () => (await opacidades(page, "#experiencia .entry"))[0]).toBe(1);
    await expect(page.locator("#experiencia .entry").first()).toHaveAttribute("data-motion", "played");
    // Parada: rolar de um lado pro outro não desloca mais nada em relação ao documento.
    const antes = await topoNoDocumento(page, "#experiencia .entry");
    await rolarAte(page, topo - 700, 600);
    await rolarAte(page, topo - 200, 600);
    expect(await topoNoDocumento(page, "#experiencia .entry")).toBe(antes);
    expect((await opacidades(page, "#experiencia .entry"))[0]).toBe(1);
  });

  test("a grade de contribuições acende em onda: a primeira semana na frente da última, e tudo aceso no fim", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await armada(page);
    const topo = await topoNoDocumento(page, ".activity-scroll");
    await rolarAte(page, topo - 620);
    const ops = await opacidades(page, ".activity-week");
    expect(ops.length).toBeGreaterThan(40);
    expect(ops[0]).toBeGreaterThan(ops[ops.length - 1]);
    await rolarAte(page, topo - 250, 2200);
    await expect.poll(async () => Math.min(...(await opacidades(page, ".activity-week"))), { timeout: 6000 }).toBe(1);
  });

  test("as três colunas de Fundamentos entram uma depois da outra", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await armada(page);
    const topo = await topoNoDocumento(page, "#fundamentos .foundations");
    await rolarAte(page, topo - 700);
    const [a, b, c] = await opacidades(page, "#fundamentos .foundation-group");
    expect(a).toBeGreaterThanOrEqual(b);
    expect(b).toBeGreaterThanOrEqual(c);
    expect(a).toBeGreaterThan(c);
  });

  test("só transform e opacity (e a origem do transform) vão pro estilo das partes animadas, e a máscara do título é estática", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await armada(page);
    const topo = await topoNoDocumento(page, "#experiencia .entry");
    await rolarAte(page, topo - 760, 900);
    const props = await page.evaluate((sel) => {
      const nomes = new Set<string>();
      for (const el of document.querySelectorAll<HTMLElement>(sel)) for (let i = 0; i < el.style.length; i++) nomes.add(el.style[i]);
      return [...nomes].sort();
    }, PARTES);
    expect(props.length).toBeGreaterThan(0);
    expect(props.filter((p) => !["opacity", "transform", "transform-origin", "translate", "scale", "rotate", "will-change"].includes(p))).toEqual([]);
    const mascara = await page.locator("#experiencia h2 .title-mask").evaluate((el) => {
      const s = getComputedStyle(el);
      return { overflow: s.overflow, clip: s.clipPath, anim: s.animationName };
    });
    expect(mascara.overflow).toBe("clip");
    expect(mascara.clip).toBe("none");
    expect(mascara.anim).toBe("none");
  });

  test("a troca de idioma não anima de novo: tudo pronto, nada pendente, e rolar depois não replica nada", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await armada(page);
    const topo = await topoNoDocumento(page, "#experiencia .entry");
    await rolarAte(page, topo - 500, 1500); // algumas seções já tocaram, outras ainda estão pendentes
    expect(await pendentes(page)).toBeGreaterThan(0);
    const yAntes = await page.evaluate(() => window.scrollY);
    await page.getByRole("button", { name: /^Idioma/ }).click();
    await page.getByRole("menuitemradio", { name: "English" }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Software Engineer");
    await expect(html(page)).not.toHaveAttribute("data-choreography", /.*/);
    expect(await pendentes(page)).toBe(0);
    expect(await opacidades(page)).not.toContain(0);
    expect(Math.abs((await page.evaluate(() => window.scrollY)) - yAntes)).toBeLessThan(120); // a troca não leva a rolagem ao topo
    await expect(page.locator("#idiomas h2")).toHaveText("Languages");
    await expect(page.locator("#experiencia h2")).toHaveText("Experience");
    await rolarTudo(page);
    expect(await opacidades(page)).not.toContain(0);
    const transformes = await page.locator(PARTES).evaluateAll((els) => els.map((el) => getComputedStyle(el).transform));
    expect(new Set(transformes)).toEqual(new Set(["none"]));
    await expect(html(page)).not.toHaveAttribute("data-choreography", /.*/);
  });

  test("se o pacote do GSAP falhar, nada fica escondido", async ({ page }) => {
    let abortados = 0;
    await page.route("**/_next/static/**/*.js", async (route) => {
      const resposta = await route.fetch();
      const corpo = await resposta.text();
      if (corpo.includes("ScrollTrigger")) {
        abortados++;
        await route.abort();
      } else await route.fulfill({ response: resposta, body: corpo });
    });
    await page.goto("/");
    await expect.poll(() => abortados, { timeout: 8000 }).toBeGreaterThan(0); // o import() foi pedido e falhou
    await page.waitForTimeout(1000);
    await expect(html(page)).not.toHaveAttribute("data-choreography", /.*/);
    expect(await pendentes(page)).toBe(0);
    expect(await opacidades(page)).not.toContain(0);
  });

  test("o vigia termina o que ficou pela metade se o relógio de animação parar (sem GSAP rodando)", async ({ page }) => {
    await page.addInitScript(() => {
      const w = window as unknown as { __congelar?: boolean };
      const raf = window.requestAnimationFrame.bind(window);
      window.requestAnimationFrame = (cb) => (w.__congelar ? 0 : raf(cb));
    });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await armada(page);
    await page.evaluate(() => ((window as unknown as { __congelar: boolean }).__congelar = true));
    const total = await page.evaluate(() => document.documentElement.scrollHeight);
    await page.evaluate((t) => window.scrollTo(0, t), total);
    await expect.poll(() => pendentes(page), { timeout: 9000 }).toBe(0);
    expect(await opacidades(page)).not.toContain(0);
  });

  for (const [largura, altura] of [[375, 667], [320, 640]] as const) {
    test(`no celular (${largura}×${altura}, toque): arma mais leve, assenta tudo e não rola de lado`, async ({ browser }) => {
      const ctx = await browser.newContext({ viewport: { width: largura, height: altura }, hasTouch: true, isMobile: true });
      const page = await ctx.newPage();
      await page.goto("/");
      await armada(page);
      // Deslocamento curto (≤ 12 px) enquanto escondido: o scrub do celular é mais leve.
      const maior = await page.locator(".entry, .foundation-group, .language").evaluateAll((els) => {
        let m = 0;
        for (const el of els) {
          const t = getComputedStyle(el).transform;
          if (t !== "none") m = Math.max(m, Math.abs(new DOMMatrixReadOnly(t).m42));
        }
        return m;
      });
      expect(maior).toBeLessThanOrEqual(12);
      await rolarTudo(page);
      await expect.poll(() => pendentes(page), { timeout: 8000 }).toBe(0);
      expect(await opacidades(page)).not.toContain(0);
      expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
      await ctx.close();
    });
  }

  test("sem rolagem lateral em 1440 depois de rolar a página toda", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await armada(page);
    await rolarTudo(page);
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
  });

  test("foco por teclado numa parte que ainda não assentou a leva direto ao estado final (nada de foco em espaço vazio)", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await armada(page);
    for (const sel of ["#experiencia h3 a", "#experiencia .stack-icon", "#carmine .link-external", "#formacao .stack-icon"]) {
      const alvo = page.locator(sel).first();
      await alvo.focus(); // o navegador rola o alvo só até a borda de baixo
      await page.waitForTimeout(350);
      const estado = await alvo.evaluate((el) => {
        const rastros: string[] = [];
        for (let n: Element | null = el; n && n !== document.body; n = n.parentElement) {
          const st = getComputedStyle(n);
          if (/opacity|transform/.test(n.getAttribute("style") ?? "") || st.opacity !== "1") rastros.push(n.tagName + "." + n.className + " " + st.opacity);
        }
        return rastros;
      });
      expect(estado, sel).toEqual([]);
    }
  });

  test("cruzar o ponto de corte de 900 px com a página aberta não refaz nem esconde de novo o que já tocou, e a rolagem fica", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await armada(page);
    const topo = await topoNoDocumento(page, "#fundamentos .foundations");
    await rolarAte(page, topo - 300, 2200);
    await expect(page.locator("#experiencia .entry").first()).toHaveAttribute("data-motion", "played");
    const tocados = await page.locator("[data-motion=played]").count();
    const y = await page.evaluate(() => window.scrollY);
    await page.setViewportSize({ width: 800, height: 900 });
    await page.waitForTimeout(1800);
    expect(Math.abs((await page.evaluate(() => window.scrollY)) - y)).toBeLessThan(400); // o texto muda de altura ao estreitar, mas a rolagem não vai a 0
    expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(300);
    expect(await page.locator("[data-motion=played]").count()).toBeGreaterThanOrEqual(tocados);
    for (const sel of ["#carmine .carmine-body", "#experiencia .entry", "#experiencia h2 .title-text", "#formacao .entry-main"]) {
      expect(await opacidades(page, sel), sel).not.toContain(0);
    }
    expect((await opacidades(page, "#experiencia .entry")).every((o) => o === 1)).toBe(true);
  });
});
