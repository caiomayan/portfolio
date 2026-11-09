import { expect, test, type Page } from "@playwright/test";

const REVEAL_TARGETS = "#carmine .carmine-body > *, #experiencia .entry, #formacao .entry, .contact .mail, .contact .contact-links";

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

for (const path of ["/", "/en"]) {
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
      // Assinatura pronta: todo traço desenhado por inteiro, sem animação.
      const offsets = await page.locator(".signature path").evaluateAll((ps) => ps.map((p) => getComputedStyle(p).strokeDashoffset));
      expect(offsets.length).toBeGreaterThan(5);
      expect(new Set(offsets)).toEqual(new Set(["0px"]));

      // Rolar, trocar de print e de tema: nada vira animação nem transição.
      await scrollToEnd(page);
      expect(await opacities(page, REVEAL_TARGETS)).not.toContain(0);
      await page.locator("#carmine").getByRole("tab").nth(1).click();
      await page.getByRole("button", { name: /^Tema|^Theme/ }).click();
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
      await expect(page.locator(".signature path").first()).toHaveCSS("animation-name", "write");
      // Só traço: o desenho termina com todo traço inteiro.
      await expect
        .poll(async () => Math.max(...(await page.locator(".signature path").evaluateAll((ps) => ps.map((p) => Math.abs(parseFloat(getComputedStyle(p).strokeDashoffset)))))), { timeout: 6000 })
        .toBeLessThan(1e-6);
      await ctx.close();
    });

    test("a assinatura fica no canto superior esquerdo e é decorativa", async ({ page }) => {
      await page.goto(path);
      const sig = page.locator(".signature");
      await expect(sig).toHaveAttribute("aria-hidden", "true");
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

    test("a troca dos prints do Carmine é suave: o painel novo entra e o antigo sai da árvore na hora", async ({ browser }) => {
      const ctx = await browser.newContext({ reducedMotion: "no-preference" });
      const page = await ctx.newPage();
      await page.goto(path);
      const abas = page.locator("#carmine").getByRole("tab");
      await abas.nth(1).click();
      // Só um painel acessível por vez, mesmo durante o fade.
      await expect(page.locator("#carmine").getByRole("tabpanel")).toHaveCount(1);
      await expect(page.locator("#carmine").getByRole("tabpanel").getByRole("img")).toHaveAttribute("alt", /Ranking/);
      const frames = page.locator("#carmine .frame");
      await expect(frames.nth(0)).toHaveCSS("transition-property", /opacity/);
      await expect(frames.nth(0)).toBeHidden();
      await expect(frames.nth(1)).toHaveCSS("opacity", "1");
      await ctx.close();
    });
  });
}
