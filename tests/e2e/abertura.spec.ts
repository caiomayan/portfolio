import { expect, test, type Page } from "@playwright/test"; // direto do Playwright: aqui a abertura roda de verdade (os outros testes partem de tests/e2e/base.ts)

// Issue #39: abertura com a assinatura (uma vez por aba, pulável, sem esconder nada sem JavaScript ou com movimento reduzido).
const html = (page: Page) => page.locator("html");
const cobertura = (page: Page) => page.locator(".opening");
const topo = (page: Page) => page.locator(".top .signature");
/** Espera a abertura acabar sozinha (≈ 1,6 s; folga pra máquina lenta). */
const terminou = async (page: Page) => {
  await expect(cobertura(page)).toHaveCount(0, { timeout: 8000 });
  await expect(html(page)).not.toHaveAttribute("data-opening", /.*/);
};
/** O voo (FLIP) da assinatura grande, pra pausar e olhar em qualquer instante. */
const pausaNoInstante = (page: Page, fracao: number) =>
  page.evaluate((f) => {
    const voo = document.getAnimations().find((a) => (a.effect as KeyframeEffect | null)?.target?.classList.contains("opening-art"));
    if (!voo) return false;
    voo.pause();
    const { delay = 0, duration } = voo.effect!.getTiming();
    voo.currentTime = Number(delay) + Number(duration) * f;
    return true;
  }, fracao);


/** Quanta tinta (preto sobre branco, soma de 255 − luminância) há num recorte da tela: mede a espessura de verdade, em pixels renderizados. */
async function tinta(page: Page, clip: { x: number; y: number; width: number; height: number }) {
  const png = (await page.screenshot({ clip })).toString("base64");
  const leitor = await page.context().newPage();
  const n = await leitor.evaluate(async (b64) => {
    const img = new Image();
    img.src = "data:image/png;base64," + b64;
    await img.decode();
    const c = document.createElement("canvas");
    c.width = img.width;
    c.height = img.height;
    const g = c.getContext("2d")!;
    g.drawImage(img, 0, 0);
    const d = g.getImageData(0, 0, c.width, c.height).data;
    let soma = 0;
    for (let i = 0; i < d.length; i += 4) soma += 255 - (d[i] + d[i + 1] + d[i + 2]) / 3;
    return Math.round(soma / 255);
  }, png);
  await leitor.close();
  return n;
}
const recorteDaAssinatura = async (page: Page) => {
  const b = (await page.locator(".top .signature-mark").boundingBox())!;
  return { x: Math.floor(b.x) - 4, y: Math.floor(b.y) - 4, width: Math.ceil(b.width) + 8, height: Math.ceil(b.height) + 8 };
};

test.describe("abertura (#39)", () => {
  test("na primeira visita da aba, a assinatura aparece grande no centro e a do topo fica no lugar, invisível", async ({ page }) => {
    await page.goto("/");
    await expect(html(page)).toHaveAttribute("data-opening", "run");
    await expect(cobertura(page)).toBeVisible();
    const grande = (await page.locator(".opening-art").boundingBox())!;
    const vp = page.viewportSize()!;
    expect(grande.width).toBeGreaterThan(vp.width * 0.4);
    expect(Math.abs(grande.x + grande.width / 2 - vp.width / 2)).toBeLessThan(4);
    expect(Math.abs(grande.y + grande.height / 2 - vp.height / 2)).toBeLessThan(4);
    expect(await topo(page).evaluate((el) => getComputedStyle(el).visibility)).toBe("hidden");
    // O h1 e a foto estão no HTML e pintados por baixo da cobertura (é o que o LCP mede).
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    expect(await page.evaluate(() => sessionStorage.getItem("opening"))).toBe("1");
  });

  test("termina sozinha: a cobertura sai do DOM e a assinatura do topo aparece pronta", async ({ page }) => {
    await page.goto("/");
    await terminou(page);
    await expect(topo(page)).toBeVisible();
    expect(await topo(page).evaluate((el) => getComputedStyle(el).visibility)).toBe("visible");
    await expect(page.getByRole("img", { name: "Caio Mayan", exact: true })).toHaveCount(1);
  });

  test("os três momentos: grande no centro, no meio do voo, e igual à assinatura do topo no fim", async ({ page }) => {
    await page.goto("/");
    await expect(cobertura(page)).toBeVisible();
    await expect.poll(() => pausaNoInstante(page, 0)).toBe(true);
    const alvo = (await page.locator(".top .signature-mark").boundingBox())!;
    const inicio = (await page.locator(".opening-art").boundingBox())!;
    await pausaNoInstante(page, 0.5);
    const meio = (await page.locator(".opening-art").boundingBox())!;
    await pausaNoInstante(page, 1);
    const fim = (await page.locator(".opening-art").boundingBox())!;
    expect(inicio.width).toBeGreaterThan(alvo.width * 1.5);
    expect(meio.width).toBeLessThan(inicio.width);
    expect(meio.width).toBeGreaterThan(alvo.width);
    expect(meio.y).toBeGreaterThan(alvo.y);
    expect(meio.y).toBeLessThan(inicio.y);
    for (const k of ["x", "y", "width", "height"] as const) expect(Math.abs(fim[k] - alvo[k])).toBeLessThan(1.5);
  });

  test("ao recarregar na mesma aba, a página aparece pronta; numa aba nova, a abertura roda de novo", async ({ page, context }) => {
    await page.goto("/");
    await terminou(page);
    await page.reload();
    await expect(html(page)).not.toHaveAttribute("data-opening", /.*/);
    await expect(cobertura(page)).toHaveCount(0);
    await expect(topo(page)).toBeVisible();
    const outra = await context.newPage();
    await outra.goto("/");
    await expect(html(outra)).toHaveAttribute("data-opening", "run");
  });

  test("um clique pula a abertura e leva direto ao estado final", async ({ page }) => {
    await page.goto("/");
    await expect(cobertura(page)).toBeVisible();
    await page.mouse.click(40, 400);
    await expect(cobertura(page)).toHaveCount(0);
    await expect(html(page)).not.toHaveAttribute("data-opening", /.*/);
    expect(await topo(page).evaluate((el) => getComputedStyle(el).visibility)).toBe("visible");
    expect(await page.evaluate(() => document.getAnimations().some((a) => (a.effect as KeyframeEffect | null)?.target?.classList.contains("opening-art")))).toBe(false);
  });

  for (const tecla of ["Tab", "Space"]) {
    test(`a tecla ${tecla} pula a abertura`, async ({ page }) => {
      await page.goto("/");
      await expect(cobertura(page)).toBeVisible();
      await page.keyboard.press(tecla);
      await expect(cobertura(page)).toHaveCount(0);
      await expect(html(page)).not.toHaveAttribute("data-opening", /.*/);
    });
  }

  test("a rolagem (roda do mouse) pula a abertura", async ({ page }) => {
    await page.goto("/");
    await expect(cobertura(page)).toBeVisible();
    await page.mouse.wheel(0, 200);
    await expect(cobertura(page)).toHaveCount(0);
    await expect(html(page)).not.toHaveAttribute("data-opening", /.*/);
  });

  test("o toque pula a abertura no celular", async ({ browser }) => {
    const ctx = await browser.newContext({ hasTouch: true, isMobile: true, viewport: { width: 375, height: 667 } });
    const page = await ctx.newPage();
    await page.goto("/");
    await expect(cobertura(page)).toBeVisible();
    const grande = (await page.locator(".opening-art").boundingBox())!;
    expect(grande.width).toBeGreaterThan(375 * 0.6);
    expect(grande.x).toBeGreaterThanOrEqual(0);
    expect(grande.x + grande.width).toBeLessThanOrEqual(375);
    await page.touchscreen.tap(190, 330);
    await expect(cobertura(page)).toHaveCount(0);
    await expect(topo(page)).toBeVisible();
    await ctx.close();
  });

  test("a troca de idioma não dispara a abertura (nem a refaz, se ela já tinha rodado)", async ({ page }) => {
    await page.goto("/");
    await terminou(page);
    await page.evaluate(() => {
      (window as unknown as { __marca: number }).__marca = 1;
    });
    await page.getByRole("button", { name: /^Idioma/ }).click();
    await page.getByRole("menuitemradio", { name: "English" }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Software Engineer");
    await expect(html(page)).not.toHaveAttribute("data-opening", /.*/);
    await expect(cobertura(page)).toHaveCount(0);
    expect(await page.evaluate(() => (window as unknown as { __marca?: number }).__marca)).toBe(1); // a página não recarregou
    await expect(topo(page)).toBeVisible();
  });

  test("a troca de idioma no meio da abertura pula pro estado final e não a refaz", async ({ page }) => {
    await page.goto("/");
    await expect(cobertura(page)).toBeVisible();
    await page.keyboard.press("Tab"); // pula
    await page.getByRole("button", { name: /^Idioma/ }).click();
    await page.getByRole("menuitemradio", { name: "Español" }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Ingeniero de Software");
    await expect(cobertura(page)).toHaveCount(0);
  });

  test("com prefers-reduced-motion: reduce, nada de abertura e a assinatura aparece pronta", async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: "reduce" });
    const page = await ctx.newPage();
    await page.goto("/");
    await expect(html(page)).not.toHaveAttribute("data-opening", /.*/);
    await expect(cobertura(page)).toHaveCount(0);
    await expect(topo(page)).toBeVisible();
    await ctx.close();
  });

  test("sem JavaScript, nada fica escondido: a assinatura e a primeira tela aparecem prontas", async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false, reducedMotion: "no-preference" });
    const page = await ctx.newPage();
    await page.goto("/");
    await expect(html(page)).not.toHaveAttribute("data-opening", /.*/);
    await expect(cobertura(page)).toBeHidden();
    await expect(topo(page)).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.locator(".who")).toBeVisible();
    await ctx.close();
  });

  test("a abertura não depende da hidratação: sem o pacote JS da página, ela termina sozinha em ≈ 1,6 s, antes do prazo de segurança", async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: "no-preference" });
    const page = await ctx.newPage();
    await page.route("**/_next/static/**/*.js", (route) => route.abort());
    await page.goto("/");
    await expect(html(page)).toHaveAttribute("data-opening", "run"); // os scripts inline rodaram; o pacote, não
    await expect(html(page)).not.toHaveAttribute("data-opening", /.*/, { timeout: 3500 }); // < 4 s do prazo de segurança
    expect(await cobertura(page).evaluate((el) => getComputedStyle(el).display)).toBe("none");
    expect(await topo(page).evaluate((el) => getComputedStyle(el).visibility)).toBe("visible");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await ctx.close();
  });

  test("o prazo de segurança (4 s) tira a cobertura mesmo se a coreografia travar", async ({ page }) => {
    await page.addInitScript(() => {
      Element.prototype.animate = function () { // sem WAAPI o script inline termina na hora; aqui simulamos uma animação que nunca acaba
        return { finished: new Promise(() => {}), cancel() {} } as unknown as Animation;
      };
    });
    await page.goto("/");
    await expect(html(page)).toHaveAttribute("data-opening", "run");
    await expect(html(page)).not.toHaveAttribute("data-opening", /.*/, { timeout: 6000 });
    await expect(cobertura(page)).toHaveCount(0);
    await expect(topo(page)).toBeVisible();
  });

  test("durante a abertura só transform, opacity e o traço (stroke-dashoffset) animam", async ({ page }) => {
    await page.goto("/");
    await expect(cobertura(page)).toBeVisible();
    const props = await page.evaluate(() => {
      const ignorar = new Set(["offset", "easing", "composite", "computedOffset"]);
      const nomes = new Set<string>();
      for (const a of document.getAnimations()) {
        for (const k of (a.effect as KeyframeEffect).getKeyframes()) for (const p of Object.keys(k)) if (!ignorar.has(p)) nomes.add(p);
      }
      return [...nomes].sort();
    });
    expect(props.length).toBeGreaterThan(0);
    const permitidas = new Set(["transform", "opacity", "strokeDashoffset", "translate"]);
    expect(props.filter((p) => !permitidas.has(p))).toEqual([]);
    expect(props).toContain("strokeDashoffset");
    expect(props).toContain("transform");
  });

  for (const [largura, altura] of [[1440, 900], [375, 667]] as const) {
    test(`a assinatura do topo depois da abertura tem o mesmo traço (1,5 px de contorno) da recarregada, da com movimento reduzido e do último quadro do voo, a ${largura} px`, async ({ browser }) => {
      const ctx = await browser.newContext({ viewport: { width: largura, height: altura }, reducedMotion: "no-preference", deviceScaleFactor: 1 });
      const page = await ctx.newPage();
      await page.goto("/");
      await expect(cobertura(page)).toBeVisible();
      const clip = await recorteDaAssinatura(page);
      // Último quadro do voo: tudo no fim (traço e voo), o que se vê é a assinatura grande já no tamanho final.
      await page.evaluate(() => {
        for (const a of document.getAnimations()) {
          const t = (a.effect as KeyframeEffect | null)?.target?.classList;
          if (t?.contains("opening-art") || t?.contains("opening-scrim") || t?.contains("opening-stroke")) {
            a.pause();
            const tm = a.effect!.getTiming();
            a.currentTime = Number(tm.delay) + Number(tm.duration);
          }
        }
      });
      const ultimoQuadro = await tinta(page, clip);
      await terminou(page);
      const depois = await tinta(page, clip);
      // Estrutura: o contorno de antes da #39 (1,5 px, não escala com o desenho) está presente, em todos os caminhos.
      const traco = await page.locator(".top .signature path.signature-outline").evaluateAll((ps) => ps.map((p) => ({ w: getComputedStyle(p).strokeWidth, v: getComputedStyle(p).vectorEffect, s: getComputedStyle(p).stroke })));
      expect(traco).toHaveLength(9);
      for (const t of traco) {
        expect(t.w).toBe("1.5px");
        expect(t.v).toBe("non-scaling-stroke");
        expect(t.s).not.toBe("none");
      }
      await page.reload();
      await expect(topo(page)).toBeVisible();
      const recarregada = await tinta(page, clip);
      const reduzido = await browser.newContext({ viewport: { width: largura, height: altura }, reducedMotion: "reduce", deviceScaleFactor: 1 });
      const p2 = await reduzido.newPage();
      await p2.goto("/");
      const semMovimento = await tinta(p2, await recorteDaAssinatura(p2));
      await reduzido.close();
      expect(depois).toBe(recarregada);
      expect(semMovimento).toBe(recarregada);
      expect(Math.abs(ultimoQuadro - depois) / depois).toBeLessThan(0.03); // sem "pulo" de espessura na troca pela assinatura do topo
      await ctx.close();
    });
  }

  test("a coreografia das seções só carrega depois da abertura e sem nenhuma entrada do usuário a abertura segue até o fim", async ({ page }) => {
    await page.goto("/");
    await expect(html(page)).toHaveAttribute("data-opening", "run");
    await page.waitForTimeout(900);
    await expect(html(page)).toHaveAttribute("data-opening", "run"); // ainda rodando com ~1 s e sem ninguém ter tocado na página
    await expect(html(page)).not.toHaveAttribute("data-choreography", /.*/);
    await terminou(page);
    await expect(html(page)).toHaveAttribute("data-choreography", "armed", { timeout: 8000 });
  });
});
