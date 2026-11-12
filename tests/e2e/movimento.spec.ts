import { expect, test, type Page } from "./base";
import { rotasTexto, type RotaTexto } from "./textos";

// As partes que a coreografia (#39, lib/choreography.ts) esconde e anima: com movimento reduzido ou sem JavaScript nenhuma pode ficar escondida.
const REVEAL_TARGETS = "h2 .title-text, .carmine-body, .entry, .foundation-group, .activity-week, .language, .site-footer, .stack li";

/** Rola até o fim da página, devagar o bastante pra cada parte chegar na tela. */
async function scrollToEnd(page: Page) {
  await page.evaluate(async () => {
    for (let y = 0; y <= document.documentElement.scrollHeight; y += 300) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 40));
    }
  });
}

const opacities = (page: Page, sel: string) =>
  page.locator(sel).evaluateAll((els) => els.map((el) => Number(getComputedStyle(el).opacity)));

for (const path of ["/", "/en", "/es"] as RotaTexto[]) {
  const t = rotasTexto[path];
  test.describe(`movimento em ${path}`, () => {
    test("com prefers-reduced-motion: reduce, nada anima e a assinatura aparece pronta", async ({ browser }) => {
      const ctx = await browser.newContext({ reducedMotion: "reduce" });
      const page = await ctx.newPage();
      await page.goto(path);
      for (const sel of [".who", "h1", ".lead"]) {
        const el = page.locator(sel).first();
        await expect(el).toHaveCSS("animation-name", "none");
        await expect(el).toHaveCSS("opacity", "1");
      }
      // Assinatura pronta e visível, sem animação: por letra, uma forma preenchida e o contorno de 1,5 px (9 letras em "Caio Mayan"; igual ao estado final de antes da #39).
      const sig = page.locator(".signature");
      await expect(sig).toBeVisible();
      await expect(sig).toHaveAttribute("data-static", "");
      await expect(sig.locator("path")).toHaveCount(18);
      await expect(sig.locator("g > path")).toHaveCount(9);
      await expect(sig.locator("g > path").first()).toHaveCSS("fill", /rgb\(/);
      await expect(sig.locator("path.signature-outline")).toHaveCount(9);
      expect(await sig.locator("mask:not(#signature-glare-mask)").count()).toBe(0); // só a máscara estática do brilho (rodada 4), nada de máscara de traço

      // Rolar e trocar de tema: nada vira animação nem transição.
      await scrollToEnd(page);
      expect(await opacities(page, REVEAL_TARGETS)).not.toContain(0);
      await page.getByRole("button", { name: t.tema }).click();
      await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
      expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
      await ctx.close();
    });

    test("com prefers-reduced-motion, as partes das seções já nascem visíveis (sem rolar)", async ({ browser }) => {
      const ctx = await browser.newContext({ reducedMotion: "reduce" });
      const page = await ctx.newPage();
      await page.goto(path);
      await page.waitForLoadState("networkidle");
      expect(await opacities(page, REVEAL_TARGETS)).not.toContain(0);
      await ctx.close();
    });

    test("sem preferência, a entrada do hero anima (controle) e a assinatura do topo já está pronta", async ({ browser }) => {
      const ctx = await browser.newContext({ reducedMotion: "no-preference" });
      const page = await ctx.newPage();
      await page.goto(path);
      await expect(page.locator("h1")).toHaveCSS("animation-name", "rise");
      // Desde a #39 o desenho do traço é da abertura (abertura.spec.ts); a assinatura do topo é sempre a versão pronta.
      const sig = page.locator(".signature");
      await expect(sig).toHaveAttribute("data-static", "");
      await expect(sig).toBeVisible();
      expect(await sig.locator("mask:not(#signature-glare-mask)").count()).toBe(0); // só a máscara estática do brilho (rodada 4), nada de máscara de traço
      await ctx.close();
    });

    test("a assinatura fica no canto superior esquerdo e é o nome do site (nome acessível)", async ({ page }) => {
      await page.goto(path);
      await expect(page.getByRole("img", { name: "Caio Mayan", exact: true })).toHaveCount(1);
      const sig = page.locator(".signature");
      await expect(sig).toHaveAttribute("aria-hidden", "true");
      await expect(sig).toBeVisible();
      const box = (await sig.boundingBox())!;
      expect(box.x).toBeLessThan(120);
      expect(box.y).toBeLessThan(60);
      expect(box.width).toBeGreaterThan(120);
    });

    test("sem JavaScript, nenhuma parte das seções fica escondida", async ({ browser }) => {
      const ctx = await browser.newContext({ javaScriptEnabled: false, reducedMotion: "no-preference" });
      const page = await ctx.newPage();
      await page.goto(path);
      expect(await opacities(page, REVEAL_TARGETS)).not.toContain(0);
      const transforms = await page.locator(REVEAL_TARGETS).evaluateAll((els) => els.map((el) => getComputedStyle(el).transform));
      expect(new Set(transforms)).toEqual(new Set(["none"]));
      await ctx.close();
    });

    test("sem preferência, as partes abaixo da dobra ficam escondidas até a coreografia e voltar ao topo não as esconde de novo", async ({ browser }) => {
      const ctx = await browser.newContext({ reducedMotion: "no-preference", viewport: { width: 1280, height: 800 } });
      const page = await ctx.newPage();
      await page.goto(path);
      await expect(page.locator("html")).toHaveAttribute("data-choreography", "armed", { timeout: 8000 });
      // Escondidas até chegarem na tela...
      await expect.poll(() => page.locator("#idiomas .language").first().evaluate((el) => getComputedStyle(el).opacity)).toBe("0");
      await scrollToEnd(page);
      // ...e visíveis depois (assentaram); voltar pro topo não esconde de novo.
      await expect.poll(async () => Math.min(...(await opacities(page, REVEAL_TARGETS))), { timeout: 8000 }).toBe(1);
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(500);
      expect(await opacities(page, REVEAL_TARGETS)).not.toContain(0);
      await ctx.close();
    });

    test("com prefers-reduced-motion, hover e clique dos controles não animam e a View Transition do tema não roda", async ({ browser }) => {
      const ctx = await browser.newContext({ reducedMotion: "reduce" });
      const page = await ctx.newPage();
      await page.goto(path);
      await page.evaluate(() => {
        const w = window as unknown as { __vt: number };
        w.__vt = 0;
        const original = document.startViewTransition?.bind(document);
        document.startViewTransition = ((cb: () => void) => {
          w.__vt++;
          return original?.(cb);
        }) as typeof document.startViewTransition;
      });
      const controles = [
        page.getByRole("button", { name: t.tema }),
        page.getByRole("button", { name: new RegExp(`^${t.idioma}`) }),
      ];
      for (const c of controles) {
        await c.scrollIntoViewIfNeeded();
        await c.hover();
        await page.mouse.down();
        await expect(c).toHaveCSS("transition-duration", "0s");
        await expect(c).toHaveCSS("transform", "none");
        expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
        await page.mouse.move(2, 2); // solta fora do controle: sem clique
        await page.mouse.up();
      }
      await page.getByRole("button", { name: t.tema }).click();
      await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
      expect(await page.evaluate(() => (window as unknown as { __vt: number }).__vt)).toBe(0);
      await ctx.close();
    });

    test("sem preferência, a troca de tema usa View Transition e só transform/opacity transicionam nos controles", async ({ browser }) => {
      const ctx = await browser.newContext({ reducedMotion: "no-preference" });
      const page = await ctx.newPage();
      await page.goto(path);
      await page.evaluate(() => {
        const w = window as unknown as { __vt: number };
        w.__vt = 0;
        const original = document.startViewTransition?.bind(document);
        if (original) document.startViewTransition = ((cb: () => void) => { w.__vt++; return original(cb); }) as typeof document.startViewTransition;
      });
      const props = await page.evaluate(() =>
        [...document.querySelectorAll("button, a")].flatMap((el) => getComputedStyle(el).transitionProperty.split(", ")),
      );
      expect(props.filter((p) => /color/.test(p))).toEqual([]);
      await page.getByRole("button", { name: t.tema }).click();
      await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
      expect(await page.evaluate(() => (window as unknown as { __vt: number }).__vt)).toBe(1);
      await ctx.close();
    });

  });
}
