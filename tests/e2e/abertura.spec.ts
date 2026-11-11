import { expect, test, type Page } from "@playwright/test"; // direto do Playwright: aqui a abertura roda de verdade (os outros testes partem de tests/e2e/base.ts)

// Issue #39: abertura com a assinatura (uma vez por aba, pulável, sem esconder nada sem JavaScript ou com movimento reduzido).
const html = (page: Page) => page.locator("html");
const cobertura = (page: Page) => page.locator(".opening");
const topo = (page: Page) => page.locator(".top .signature");
/** Espera a abertura acabar sozinha (≈ 3 s; folga pra máquina lenta). */
const terminou = async (page: Page) => {
  await expect(cobertura(page)).toHaveCount(0, { timeout: 8000 });
  await expect(html(page)).not.toHaveAttribute("data-opening", /.*/);
};
const PRIMEIRA_TELA = [".hero .who", ".hero h1", ".hero .lead", ".hero .place", ".hero .contact-icons", ".top-actions"];
/** Pausa a abertura num instante (ms depois do início): traço, respiro, voo, cobertura e a entrada da primeira tela vão todos pra esse ponto da linha do tempo (lib/opening.ts). */
const irPara = (page: Page, ms: number) =>
  page.evaluate(
    ([t, sels]) => {
      let n = 0;
      for (const a of document.getAnimations()) {
        const alvo = (a.effect as KeyframeEffect | null)?.target as Element | null;
        const daAbertura = !!alvo?.closest(".opening") || (a.constructor.name !== "CSSAnimation" && sels.some((s) => alvo?.matches(s)));
        if (daAbertura) {
          a.pause();
          a.currentTime = t;
          n++;
        }
      }
      return n;
    },
    [ms, PRIMEIRA_TELA] as [number, string[]],
  );
const opac = (page: Page) => page.evaluate((sels) => sels.map((s) => Number(getComputedStyle(document.querySelector(s)!).opacity)), PRIMEIRA_TELA);
const svgGrande = (page: Page) => page.locator(".opening-art-svg").boundingBox();

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
    const grande = (await svgGrande(page))!;
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

  test("os momentos: grande no centro, o respiro (recua 1,5 %), o voo com arco e o pouso igual à assinatura do topo", async ({ page }) => {
    await page.goto("/");
    await expect(cobertura(page)).toBeVisible();
    await expect.poll(() => irPara(page, 1700)).toBeGreaterThan(10);
    const alvo = (await page.locator(".top .signature-mark").boundingBox())!;
    const grande = (await svgGrande(page))!;
    await irPara(page, 2020); // fim do respiro
    const respiro = (await svgGrande(page))!;
    await irPara(page, 2020 + 220); // início do voo
    const a = (await svgGrande(page))!;
    await irPara(page, 2020 + 860 * 0.5);
    const meio = (await svgGrande(page))!;
    await irPara(page, 5000);
    const fim = (await svgGrande(page))!;
    expect(grande.width).toBeGreaterThan(alvo.width * 1.5);
    expect(respiro.width / grande.width).toBeGreaterThan(0.975); // a tinta assenta: recua ~1,5 %, nada mais
    expect(respiro.width / grande.width).toBeLessThan(0.995);
    expect(a.width).toBeLessThan(respiro.width);
    expect(meio.width).toBeLessThan(a.width);
    expect(meio.width).toBeGreaterThan(alvo.width);
    for (const k of ["x", "y", "width", "height"] as const) expect(Math.abs(fim[k] - alvo[k])).toBeLessThan(1.5);
    // Arco: X e Y andam em frações diferentes do caminho (curvas diferentes), então a rota não é uma reta.
    const fx = (respiro.x - a.x) / (respiro.x - alvo.x);
    const fy = (respiro.y - a.y) / (respiro.y - alvo.y);
    expect(Math.abs(fx - fy)).toBeGreaterThan(0.03);
  });

  test("o traço tem cadência de caneta: letras com durações diferentes, easing que não é linear, termina entre 1,5 e 1,9 s", async ({ page }) => {
    await page.goto("/");
    await expect(cobertura(page)).toBeVisible();
    const tracos = await page.evaluate(() =>
      document
        .getAnimations()
        .filter((a) => (a.effect as KeyframeEffect | null)?.target?.classList.contains("opening-stroke"))
        .map((a) => {
          const t = a.effect!.getTiming();
          return { ini: Number(t.delay), dur: Number(t.duration), ease: String((a.effect as KeyframeEffect).getKeyframes()[0].easing) }; // no CSS o easing vai nos quadros-chave
        }),
    );
    expect(tracos.length).toBe(18); // contorno + máscara, 9 letras
    expect(new Set(tracos.map((t) => t.dur)).size).toBeGreaterThanOrEqual(4); // ritmo não uniforme
    expect(Math.max(...tracos.map((t) => t.dur))).toBeGreaterThan(Math.min(...tracos.map((t) => t.dur)) * 1.8);
    for (const t of tracos) expect(t.ease).not.toBe("linear");
    const fim = Math.max(...tracos.map((t) => t.ini + t.dur));
    expect(fim).toBeGreaterThan(1500);
    expect(fim).toBeLessThan(1900);
  });

  test("a duração total até a página pronta fica em ≈ 3 s (entre 2,6 e 3,6 s), abaixo do prazo de segurança", async ({ page }) => {
    await page.addInitScript(() => {
      const w = window as unknown as { __visto?: boolean; __fim?: number };
      const iv = setInterval(() => {
        const d = document.documentElement;
        if (d?.dataset.opening) w.__visto = true;
        if (w.__visto && d && !d.dataset.opening) {
          w.__fim = performance.now();
          clearInterval(iv);
        }
      }, 10);
    });
    await page.goto("/");
    await expect.poll(() => page.evaluate(() => (window as unknown as { __fim?: number }).__fim ?? 0), { timeout: 8000 }).toBeGreaterThan(0);
    const fim = await page.evaluate(() => (window as unknown as { __fim: number }).__fim);
    expect(fim).toBeGreaterThan(2600);
    expect(fim).toBeLessThan(3600);
  });

  test("a primeira tela entra em sequência na ordem foto, título, frase, lugar, contato, controles enquanto a assinatura pousa", async ({ page }) => {
    await page.goto("/");
    await expect(cobertura(page)).toBeVisible();
    await expect.poll(() => irPara(page, 1900)).toBeGreaterThan(20);
    expect(await opac(page)).toEqual([1, 1, 1, 1, 1, 1]); // visível até o fim do respiro (é o que o LCP mede)
    await irPara(page, 2020 + 120 + 90); // começando a entrar: a ordem decide quem está mais adiantado
    const o = await opac(page);
    for (let i = 1; i < o.length; i++) expect(o[i], PRIMEIRA_TELA[i]).toBeLessThanOrEqual(o[i - 1] + 1e-6);
    expect(o[0]).toBeGreaterThan(o[o.length - 1]);
    await irPara(page, 2020 + 860 + 400);
    expect(await opac(page)).toEqual([1, 1, 1, 1, 1, 1]);
    await terminou(page);
    for (const sel of PRIMEIRA_TELA) {
      await expect(page.locator(sel).first()).toHaveCSS("opacity", "1");
      await expect(page.locator(sel).first()).toHaveCSS("transform", /^(none|matrix\(1, 0, 0, 1, 0, 0\))$/);
    }
  });

  for (const [largura, altura] of [[1440, 900], [375, 667]] as const) {
    test(`a primeira tela nunca pisca a ${largura} px com a CPU 4× mais lenta: depois que a cobertura começa a levantar, o título só ganha opacidade`, async ({ browser }) => {
      for (let rodada = 0; rodada < 3; rodada++) {
        const ctx = await browser.newContext({ viewport: { width: largura, height: altura }, reducedMotion: "no-preference" });
        const page = await ctx.newPage();
        const cdp = await ctx.newCDPSession(page);
        await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
        await page.addInitScript(() => {
          const w = window as unknown as { __amostras: number[][] };
          w.__amostras = [];
          const tick = () => {
            const h1 = document.querySelector("h1");
            const cob = document.querySelector(".opening-scrim");
            if (h1) w.__amostras.push([Number(getComputedStyle(h1).opacity), cob ? Number(getComputedStyle(cob).opacity) : 0]);
            if (w.__amostras.length < 600) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        });
        await page.goto("/");
        await expect(page.locator("html")).not.toHaveAttribute("data-opening", /.*/, { timeout: 9000 });
        const amostras = await page.evaluate(() => (window as unknown as { __amostras: number[][] }).__amostras);
        const depois = amostras.filter(([, cob]) => cob < 0.999);
        expect(depois.length).toBeGreaterThan(5);
        for (let i = 1; i < depois.length; i++) expect(depois[i][0], `rodada ${rodada}, amostra ${i}`).toBeGreaterThanOrEqual(depois[i - 1][0] - 0.001);
        expect(depois[depois.length - 1][0]).toBe(1);
        await ctx.close();
      }
    });
  }

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
    expect(await page.evaluate(() => document.getAnimations().some((a) => (a.effect as KeyframeEffect | null)?.target?.closest(".opening")))).toBe(false);
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
    const grande = (await svgGrande(page))!;
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

  test("a abertura não depende da hidratação: sem o pacote JS da página, ela termina sozinha em ≈ 3 s, antes do prazo de segurança", async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: "no-preference" });
    const page = await ctx.newPage();
    await page.route("**/_next/static/**/*.js", (route) => route.abort());
    await page.goto("/");
    await expect(html(page)).toHaveAttribute("data-opening", "run"); // os scripts inline rodaram; o pacote, não
    await expect(html(page)).not.toHaveAttribute("data-opening", /.*/, { timeout: 4600 }); // < 5 s do prazo de segurança
    expect(await cobertura(page).evaluate((el) => getComputedStyle(el).display)).toBe("none");
    expect(await topo(page).evaluate((el) => getComputedStyle(el).visibility)).toBe("visible");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await ctx.close();
  });

  test("o prazo de segurança (5 s) tira a cobertura mesmo se a coreografia travar", async ({ page }) => {
    await page.addInitScript(() => {
      Element.prototype.animate = function () { // sem WAAPI o script inline termina na hora; aqui simulamos uma animação que nunca acaba
        return { finished: new Promise(() => {}), cancel() {} } as unknown as Animation;
      };
    });
    await page.goto("/");
    await expect(html(page)).toHaveAttribute("data-opening", "run");
    await expect(html(page)).not.toHaveAttribute("data-opening", /.*/, { timeout: 8500 });
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
          if (t?.contains("opening-art") || t?.contains("opening-art-svg") || t?.contains("opening-scrim") || t?.contains("opening-stroke")) {
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
