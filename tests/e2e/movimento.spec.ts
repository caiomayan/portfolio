import { expect, test, type Page } from "@playwright/test";
import { rotasTexto, type RotaTexto } from "./textos";

// Mesma marcação que o componente Reveal usa: nenhuma lista de seletores própria.
const REVEAL_TARGETS = "[data-reveal-part]";

/** Rola até o fim da página, devagar o bastante pro observer ver cada parte. */
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

for (const path of ["/", "/en"] as RotaTexto[]) {
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
      // Assinatura pronta e visível, sem animação: uma forma preenchida por letra (9 letras em "Caio Mayan").
      const sig = page.locator(".signature");
      await expect(sig).toBeVisible();
      await expect(sig).toHaveAttribute("data-static", "");
      await expect(sig.locator("path")).toHaveCount(9);
      await expect(sig.locator("path").first()).toHaveCSS("fill", /rgb\(/);
      expect(await sig.locator("mask").count()).toBe(0);

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

    test("sem preferência, a entrada do hero e a assinatura animam (controle)", async ({ browser }) => {
      const ctx = await browser.newContext({ reducedMotion: "no-preference" });
      const page = await ctx.newPage();
      await page.goto(path);
      await expect(page.locator("h1")).toHaveCSS("animation-name", "rise");
      // Depois do mount a assinatura passa a ser desenhada (motion): a última letra ainda nem começou...
      const sig = page.locator(".signature");
      await expect(sig).not.toHaveAttribute("data-static", "");
      const ultima = sig.locator(":scope > path").last();
      expect(Number(await ultima.evaluate((el) => getComputedStyle(el).opacity))).toBe(0);
      // ...e o desenho termina com todas as letras inteiras.
      await expect
        .poll(async () => Math.min(...(await sig.locator(":scope > path").evaluateAll((ps) => ps.map((p) => Number(getComputedStyle(p).opacity))))), { timeout: 8000 })
        .toBe(1);
      await expect(ultima).toHaveCSS("stroke-dashoffset", /^0(px)?$/);
      await ctx.close();
    });

    test("a assinatura fica no canto superior esquerdo e é o nome do site (nome acessível)", async ({ page }) => {
      await page.goto(path);
      await expect(page.getByRole("img", { name: "Caio Mayan", exact: true })).toHaveCount(1);
      const sig = page.locator(".signature");
      await expect(sig).toHaveAttribute("aria-hidden", "true");
      await expect(sig).toBeVisible();
      await expect.poll(() => sig.boundingBox()).not.toBeNull(); // a versão pronta é trocada pela animada logo após o mount
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

    test("sem preferência, as partes abaixo da dobra entram uma vez, em sequência", async ({ browser }) => {
      const ctx = await browser.newContext({ reducedMotion: "no-preference", viewport: { width: 1280, height: 800 } });
      const page = await ctx.newPage();
      await page.goto(path);
      await page.waitForLoadState("networkidle");
      // Escondidas até chegarem na tela...
      await expect.poll(() => page.locator(".contact .mail").evaluate((el) => getComputedStyle(el).opacity)).toBe("0");
      await scrollToEnd(page);
      // ...e visíveis depois; voltar pro topo não esconde de novo.
      await expect.poll(async () => Math.min(...(await opacities(page, REVEAL_TARGETS))), { timeout: 5000 }).toBe(1);
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(300);
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
        page.getByRole("link", { name: t.outraLingua }),
        page.getByRole("button", { name: t.copiar }),
      ];
      for (const c of controles) {
        await c.scrollIntoViewIfNeeded();
        await c.hover();
        await page.mouse.down();
        await expect(c).toHaveCSS("transition-duration", "0s");
        await expect(c).toHaveCSS("transform", "none");
        expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
        await page.mouse.move(2, 2); // solta fora do controle: sem clique (o link de língua navegaria)
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
