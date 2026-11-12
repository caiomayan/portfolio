import { expect, test, type Page } from "@playwright/test"; // direto do Playwright: aqui a abertura roda de verdade (os outros testes partem de tests/e2e/base.ts)

// Issue #39: abertura com a assinatura (uma vez por aba, pulável, sem esconder nada sem JavaScript ou com movimento reduzido). Rodada 5: cobertura que se recolhe como uma folha, voo com mola, inclinação, pouso que encaixa.
const html = (page: Page) => page.locator("html");
const cobertura = (page: Page) => page.locator(".opening");
const topo = (page: Page) => page.locator(".top .signature");
/** Espera a abertura acabar sozinha (≈ 3,2 s; folga pra máquina lenta). */
const terminou = async (page: Page) => {
  await expect(cobertura(page)).toHaveCount(0, { timeout: 8000 });
  await expect(html(page)).not.toHaveAttribute("data-opening", /.*/);
  await expect(html(page)).not.toHaveAttribute("data-shine", /.*/, { timeout: 4000 }); // a passada de brilho da assinatura (rodada 4) acaba ~1,3 s depois
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

  test("os momentos: grande no centro, o respiro (recua 1,5 %), o voo com arco, o pouso 1,5 % maior que encaixa e o último quadro igual à assinatura do topo", async ({ page }) => {
    await page.goto("/");
    await expect(cobertura(page)).toBeVisible();
    await expect.poll(() => irPara(page, 1700)).toBeGreaterThan(10);
    const alvo = (await page.locator(".top .signature-mark").boundingBox())!;
    const grande = (await svgGrande(page))!;
    await irPara(page, 2020); // fim do respiro
    const respiro = (await svgGrande(page))!;
    await irPara(page, 2020 + 220); // início do voo
    const a = (await svgGrande(page))!;
    await irPara(page, 2020 + 920 * 0.5);
    const meio = (await svgGrande(page))!;
    await irPara(page, 2020 + 920); // pouso: chega 1,5 % maior
    const pouso = (await svgGrande(page))!;
    await irPara(page, 5000);
    const fim = (await svgGrande(page))!;
    expect(grande.width).toBeGreaterThan(alvo.width * 1.5);
    expect(respiro.width / grande.width).toBeGreaterThan(0.975); // a tinta assenta: recua ~1,5 %, nada mais
    expect(respiro.width / grande.width).toBeLessThan(0.995);
    expect(a.width).toBeLessThan(respiro.width);
    expect(meio.width).toBeLessThan(a.width);
    expect(meio.width).toBeGreaterThan(alvo.width);
    expect(pouso.width / alvo.width).toBeGreaterThan(1.01); // assentamento de 1–2 %: chega um pouco maior e encaixa
    expect(pouso.width / alvo.width).toBeLessThan(1.02);
    for (const k of ["x", "y", "width", "height"] as const) expect(Math.abs(fim[k] - alvo[k])).toBeLessThan(1.5);
    // Arco: X e Y andam em frações diferentes do caminho (molas com rigidezes diferentes), então a rota não é uma reta.
    const fx = (respiro.x - a.x) / (respiro.x - alvo.x);
    const fy = (respiro.y - a.y) / (respiro.y - alvo.y);
    expect(Math.abs(fx - fy)).toBeGreaterThan(0.03);
  });

  test("o voo é uma mola sem quique (linear() gerado, com a curva de antes como alternativa) e nunca passa do alvo; a assinatura escreve inclinada e se endireita", async ({ page }) => {
    await page.goto("/");
    await expect(cobertura(page)).toBeVisible();
    const curvas = await page.evaluate(() =>
      document
        .getAnimations()
        .filter((a) => a.constructor.name !== "CSSAnimation" && ((a.effect as KeyframeEffect).target as Element | null)?.matches(".opening-art-svg, .opening-art, .opening-scrim"))
        .map((a) => ({ alvo: String(((a.effect as KeyframeEffect).target as Element).getAttribute("class")), easings: [...(a.effect as KeyframeEffect).getKeyframes().map((k) => String(k.easing)), String(a.effect!.getTiming().easing)] })),
    );
    const suporta = await page.evaluate(() => CSS.supports("animation-timing-function", "linear(0, 1)"));
    expect(curvas.length).toBe(3);
    for (const c of curvas) expect(c.easings.some((e) => (suporta ? e.startsWith("linear(") && e.length > 80 : e.startsWith("cubic-bezier"))), String(c.alvo)).toBe(true);
    // Sem quique: do começo do voo ao pouso a largura só diminui e nunca fica abaixo do pouso (1,5 % maior que o alvo).
    const alvo = (await page.locator(".top .signature-mark").boundingBox())!;
    let anterior = Infinity;
    for (const t of [2020, 2300, 2600, 2900, 2960, 3050]) {
      await irPara(page, t);
      const w = (await svgGrande(page))!.width;
      expect(w, `t=${t}`).toBeLessThanOrEqual(anterior + 0.5);
      expect(w, `t=${t}`).toBeGreaterThanOrEqual(alvo.width - 0.5);
      anterior = w;
    }
    // Inclinação: -1,6° enquanto escreve, 0° no pouso (no invólucro; o <svg> não leva rotação, senão entortaria).
    const rot = async (t: number) => {
      await irPara(page, t);
      return page.locator(".opening-art").evaluate((el) => { const m = getComputedStyle(el).transform; return m === "none" ? 0 : (Math.atan2(new DOMMatrixReadOnly(m).b, new DOMMatrixReadOnly(m).a) * 180) / Math.PI; });
    };
    expect(await rot(900)).toBeCloseTo(-1.6, 1);
    expect(Math.abs(await rot(2020 + 920))).toBeLessThan(0.05);
    await irPara(page, 2400);
    expect(await page.locator(".opening-art-svg").evaluate((el) => { const m = new DOMMatrixReadOnly(getComputedStyle(el).transform); return Math.abs(m.b) + Math.abs(m.c); })).toBeLessThan(1e-6);
  });

  test("a cobertura é uma folha que se recolhe pra cima (translateY, cantos de baixo arredondados e sombra), sem fade e sem clip-path", async ({ page }) => {
    await page.goto("/");
    await expect(cobertura(page)).toBeVisible();
    const estilo = await page.locator(".opening-scrim").evaluate((el) => { const s = getComputedStyle(el); return { raio: s.borderBottomLeftRadius, sombra: s.boxShadow, clip: s.clipPath, filtro: s.filter }; });
    expect(estilo.raio).toBe("28px");
    expect(estilo.sombra).not.toBe("none");
    expect(estilo.clip).toBe("none");
    expect(estilo.filtro).toBe("none");
    const altura = page.viewportSize()!.height;
    const ty = async (t: number) => {
      await irPara(page, t);
      return page.locator(".opening-scrim").evaluate((el) => { const m = getComputedStyle(el).transform; return m === "none" ? 0 : new DOMMatrixReadOnly(m).m42; });
    };
    expect(await ty(2020)).toBe(0); // fechada até o voo
    const meio = await ty(2020 + 80 + 400);
    expect(meio).toBeLessThan(-altura * 0.2); // já recolheu boa parte
    expect(meio).toBeGreaterThan(-altura * 1.1);
    expect(await ty(2020 + 80 + 940)).toBeLessThan(-altura * 1.05); // fora da tela, a sombra de baixo inclusive
    let anterior = 1;
    for (const t of [2100, 2300, 2500, 2700, 2900, 3040]) {
      const v = await ty(t);
      expect(v, `t=${t}`).toBeLessThanOrEqual(anterior + 0.01);
      anterior = v;
    }
    const opac = await page.locator(".opening-scrim").evaluate((el) => Number(getComputedStyle(el).opacity));
    expect(opac).toBe(1); // nada de esmaecer: só se recolhe
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

  test("a duração total até a página pronta fica em ≈ 3,2 s (entre 3,0 e 3,5 s), abaixo do prazo de segurança", async ({ page }) => {
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
    expect(fim).toBeGreaterThan(3000);
    expect(fim).toBeLessThan(3500);
  });

  test("a primeira tela sobe ao lugar em sequência (foto, título, frase, lugar, contato, controles) sob a borda da cobertura, sempre visível (opacity 1)", async ({ page }) => {
    await page.goto("/");
    await expect(cobertura(page)).toBeVisible();
    const sobe = (sels: string[]) => page.evaluate((ss) => ss.map((s) => { const m = getComputedStyle(document.querySelector(s)!).transform; return m === "none" ? 0 : new DOMMatrixReadOnly(m).m42; }), sels);
    await expect.poll(() => irPara(page, 1900)).toBeGreaterThan(10);
    expect(await opac(page)).toEqual([1, 1, 1, 1, 1, 1]); // visível desde o começo (é o que o LCP mede); nada é escondido
    const antes = await sobe(PRIMEIRA_TELA);
    for (const v of antes) expect(v).toBeCloseTo(28, 0); // todos 28 px abaixo do lugar, por baixo da cobertura opaca
    await irPara(page, 2020 + 160 + 200); // começando a subir: a ordem decide quem está mais adiantado
    const o = await sobe(PRIMEIRA_TELA);
    expect(await opac(page)).toEqual([1, 1, 1, 1, 1, 1]);
    for (let i = 1; i < o.length; i++) expect(o[i], PRIMEIRA_TELA[i]).toBeGreaterThanOrEqual(o[i - 1] - 1e-6);
    expect(o[0]).toBeLessThan(o[o.length - 1]);
    await irPara(page, 2020 + 160 + 5 * 50 + 700 + 40);
    expect(await sobe(PRIMEIRA_TELA)).toEqual([0, 0, 0, 0, 0, 0]);
    await terminou(page);
    for (const sel of PRIMEIRA_TELA) {
      await expect(page.locator(sel).first()).toHaveCSS("opacity", "1");
      await expect(page.locator(sel).first()).toHaveCSS("transform", /^(none|matrix\(1, 0, 0, 1, 0, 0\))$/);
    }
  });

  for (const [largura, altura] of [[1440, 900], [375, 667]] as const) {
    test(`a primeira tela nunca pisca a ${largura} px com a CPU 4× mais lenta: depois que a cobertura começa a subir o título fica sempre opaco e ela só sobe (nunca volta)`, async ({ browser }) => {
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
            if (h1) {
              const m = cob ? getComputedStyle(cob).transform : "none";
              w.__amostras.push([Number(getComputedStyle(h1).opacity), m === "none" ? 0 : new DOMMatrixReadOnly(m).m42]);
            }
            if (w.__amostras.length < 600) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        });
        await page.goto("/");
        await expect(page.locator("html")).not.toHaveAttribute("data-opening", /.*/, { timeout: 9000 });
        const amostras = await page.evaluate(() => (window as unknown as { __amostras: number[][] }).__amostras);
        expect(amostras.length).toBeGreaterThan(20);
        const subindo = amostras.filter(([, y]) => y < 0);
        expect(subindo.length).toBeGreaterThan(3);
        for (const [h1] of subindo) expect(h1, `rodada ${rodada}`).toBe(1); // depois que a cobertura começa a subir, o título nunca esmaece nem pisca
        const sobe = subindo.map(([, y]) => y);
        for (let i = 1; i < sobe.length; i++) expect(sobe[i], `rodada ${rodada}, amostra ${i}`).toBeLessThanOrEqual(sobe[i - 1] + 0.01); // a cobertura só sobe
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

  for (const [largura, altura, min, max] of [[1920, 1080, 219, 221], [1440, 900, 219, 221], [375, 667, 140, 155]] as const) {
    test(`a assinatura do topo tem tamanho de logomarca a ${largura} px (${min}–${max} px de largura), na mesma proporção, e a abertura pousa nesse tamanho`, async ({ browser }) => {
      const ctx = await browser.newContext({ viewport: { width: largura, height: altura }, reducedMotion: "no-preference" });
      const page = await ctx.newPage();
      await page.goto("/");
      await expect(cobertura(page)).toBeVisible();
      const alvo = (await page.locator(".top .signature-mark").boundingBox())!;
      expect(alvo.width).toBeGreaterThanOrEqual(min);
      expect(alvo.width).toBeLessThanOrEqual(max);
      expect(Math.abs(alvo.width / alvo.height - 1371.08 / 389.58)).toBeLessThan(0.02); // proporção do desenho
      await expect.poll(() => irPara(page, 5000)).toBeGreaterThan(5);
      const fim = (await svgGrande(page))!;
      expect(Math.abs(fim.width - alvo.width)).toBeLessThan(1.5);
      expect(Math.abs(fim.height - alvo.height)).toBeLessThan(1.5);
      await terminou(page);
      const final = (await page.locator(".top .signature-mark").boundingBox())!;
      expect(Math.abs(final.width - alvo.width)).toBeLessThan(0.5);
      await ctx.close();
    });
  }

  test("o traço nasce mais leve e encorpa até o respiro (pressão: opacidade do contorno), sem blur", async ({ page }) => {
    await page.goto("/");
    await expect(cobertura(page)).toBeVisible();
    const op = async (t: number) => {
      await irPara(page, t);
      return page.locator(".opening-ink").evaluate((el) => Number(getComputedStyle(el).opacity));
    };
    const a = await op(100);
    const b = await op(1000);
    const c = await op(2020);
    expect(a).toBeGreaterThanOrEqual(0.55 - 0.01);
    expect(a).toBeLessThan(0.7);
    expect(b).toBeGreaterThan(a);
    expect(c).toBeCloseTo(1, 2); // chega ao peso final no respiro, sem salto no fim
    expect(await page.locator(".opening-art").evaluate((el) => getComputedStyle(el).filter)).toBe("none");
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
        if ((a.effect as KeyframeEffect).target?.closest(".lead-shine")) continue; // o brilho da frase (rodada 4) anima background-position, parado durante a abertura (teste abaixo)
        for (const k of (a.effect as KeyframeEffect).getKeyframes()) for (const p of Object.keys(k)) if (!ignorar.has(p)) nomes.add(p);
      }
      return [...nomes].sort();
    });
    expect(props.length).toBeGreaterThan(0);
    const permitidas = new Set(["transform", "opacity", "strokeDashoffset", "translate"]); // sem blur, sem clip-path, sem filter
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
          if (t?.contains("opening-art") || t?.contains("opening-art-svg") || t?.contains("opening-scrim") || t?.contains("opening-stroke") || t?.contains("opening-ink")) {
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
      expect(Math.abs(ultimoQuadro - depois) / depois).toBeLessThan(0.05); // sem "pulo" de espessura (a 375 px a assinatura tem 148 px e cai em meio pixel: a tinta varia um pouco mais) na troca pela assinatura do topo
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

  test("o brilho da frase fica parado durante a abertura e só corre depois dela", async ({ page }) => {
    await page.goto("/");
    await expect(cobertura(page)).toBeVisible();
    const estado = () => page.locator(".lead-shine").evaluate((el) => el.getAnimations().map((a) => a.playState));
    expect(await estado()).toEqual(["paused"]);
    await terminou(page);
    await expect.poll(estado).toEqual(["running"]);
  });

  test("a passada de brilho da assinatura: uma vez, só no fim natural da abertura, só com transform e opacity", async ({ page }) => {
    await page.goto("/");
    await expect(html(page)).toHaveAttribute("data-shine", "", { timeout: 8000 });
    const a = await page.locator(".signature-glare").evaluate((el) => {
      const anim = el.getAnimations()[0];
      const kf = (anim.effect as KeyframeEffect).getKeyframes();
      return { n: el.getAnimations().length, it: anim.effect!.getTiming().iterations, dur: Number(anim.effect!.getTiming().duration), props: [...new Set(kf.flatMap((k) => Object.keys(k)))] };
    });
    expect(a.n).toBe(1);
    expect(a.it).toBe(1); // uma vez, sem loop
    expect(a.props.filter((p) => !["offset", "easing", "composite", "computedOffset", "opacity", "transform"].includes(p))).toEqual([]);
    await expect(html(page)).not.toHaveAttribute("data-shine", /.*/, { timeout: 4000 });
    expect(await page.locator(".signature-glare").evaluate((el) => el.getAnimations().length)).toBe(0);
    // Mesma estrutura de antes (a máscara usa <use>: nenhum caminho novo): 9 letras preenchidas + 9 contornos.
    expect(await page.locator(".top .signature path").count()).toBe(18);
  });

  test("sem passada de brilho: ao recarregar (segunda visita), ao pular a abertura e com movimento reduzido", async ({ page, browser }) => {
    await page.goto("/");
    await terminou(page);
    await page.reload();
    await page.waitForTimeout(600);
    await expect(html(page)).not.toHaveAttribute("data-shine", /.*/);
    const outra = await page.context().newPage();
    await outra.goto("/");
    await expect(cobertura(outra)).toBeVisible();
    await outra.keyboard.press("Tab"); // pula
    await outra.waitForTimeout(600);
    await expect(html(outra)).not.toHaveAttribute("data-shine", /.*/);
    const ctx = await browser.newContext({ reducedMotion: "reduce" });
    const p3 = await ctx.newPage();
    await p3.goto("/");
    await p3.waitForTimeout(600);
    await expect(p3.locator("html")).not.toHaveAttribute("data-shine", /.*/);
    await ctx.close();
  });
});
