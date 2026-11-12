import { expect, test } from "./base";

// Issue #18: Lenis só no desktop, desligado com prefers-reduced-motion, sem quebrar links internos e teclado.
for (const rota of ["/", "/en", "/es"]) {
  test.describe(`rolagem suave em ${rota}`, () => {
    test("liga no desktop (ponteiro fino) e não liga com movimento reduzido", async ({ browser }) => {
      const desktop = await browser.newContext({ reducedMotion: "no-preference" });
      const p1 = await desktop.newPage();
      await p1.goto(rota);
      await expect(p1.locator("html")).toHaveClass(/lenis/);
      await desktop.close();

      const reduzido = await browser.newContext({ reducedMotion: "reduce" });
      const p2 = await reduzido.newPage();
      await p2.goto(rota);
      await p2.waitForLoadState("networkidle");
      await expect(p2.locator("html")).not.toHaveClass(/lenis/);
      await reduzido.close();
    });

    test("não liga no toque (celular)", async ({ browser }) => {
      const ctx = await browser.newContext({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 }, reducedMotion: "no-preference" });
      const page = await ctx.newPage();
      await page.goto(rota);
      await page.waitForLoadState("networkidle");
      await expect(page.locator("html")).not.toHaveClass(/lenis/);
      await ctx.close();
    });

    test("desliga ao pedir movimento reduzido com a página aberta", async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await page.goto(rota);
      await expect(page.locator("html")).toHaveClass(/lenis/);
      await page.emulateMedia({ reducedMotion: "reduce" });
      await expect(page.locator("html")).not.toHaveClass(/lenis/);
    });

    test("a roda rola a página e as entradas ao rolar continuam aparecendo", async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await page.goto(rota);
      await expect(page.locator("html")).toHaveClass(/lenis/);
      await page.waitForLoadState("networkidle");
      await expect.poll(() => page.locator("#idiomas .language").first().evaluate((el) => getComputedStyle(el).opacity)).toBe("0");
      await page.mouse.move(600, 400);
      for (let i = 0; i < 40; i++) {
        await page.mouse.wheel(0, 400);
        await page.waitForTimeout(40);
      }
      await expect.poll(() => page.evaluate(() => scrollY), { timeout: 8000 }).toBeGreaterThan(1500);
      await expect.poll(() => page.locator("#idiomas .language").first().evaluate((el) => getComputedStyle(el).opacity), { timeout: 8000 }).toBe("1");
    });

    test("link interno (#carmine) rola até a seção, atualiza o endereço e leva o foco; o próximo Tab parte dali", async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await page.goto(rota);
      await expect(page.locator("html")).toHaveClass(/lenis/);
      await page.evaluate(() => {
        const a = document.createElement("a");
        a.href = "#carmine";
        a.id = "ir-carmine";
        a.textContent = "ir";
        a.style.cssText = "position:fixed;top:0;left:0;z-index:99;background:#fff";
        document.body.append(a);
      });
      await page.locator("#ir-carmine").click();
      await expect(page).toHaveURL(/#carmine$/);
      await expect
        .poll(async () => Math.abs((await page.locator("#carmine").boundingBox())!.y), { timeout: 8000 })
        .toBeLessThan(5);
      await expect(page.locator("#carmine")).toBeFocused();
      await page.keyboard.press("Tab");
      expect(await page.evaluate(() => !!document.activeElement?.closest("#carmine"))).toBe(true);
    });

    test("teclado continua nativo: PageDown e End rolam a página", async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await page.goto(rota);
      await expect(page.locator("html")).toHaveClass(/lenis/);
      await page.keyboard.press("PageDown");
      await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(550);
      await page.waitForTimeout(800); // o PageDown nativo assenta antes do End
      await page.keyboard.press("End");
      await expect.poll(() => page.evaluate(() => scrollY + innerHeight >= document.documentElement.scrollHeight - 2)).toBe(true);
    });
  });
}
