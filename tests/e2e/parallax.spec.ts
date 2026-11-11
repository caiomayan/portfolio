import { expect, test, type Page } from "./base";

// Issue #39: parallax sutil na rolagem (só translate; o texto corrido não se mexe; desligado com movimento reduzido e no toque).
const deslocamento = (page: Page, seletor: string) =>
  page.locator(seletor).first().evaluate((el) => {
    const t = getComputedStyle(el).translate;
    return t === "none" ? 0 : parseFloat(t.split(" ")[1] ?? "0");
  });
const rolarComRoda = async (page: Page, y: number) => {
  await page.mouse.move(700, 400);
  await page.mouse.wheel(0, y);
  await expect.poll(() => page.evaluate(() => window.scrollY), { timeout: 8000 }).toBeGreaterThan(y - 60);
  await page.waitForTimeout(700); // o Lenis assenta
};

test.describe("parallax (#39)", () => {
  test("no desktop a foto e o mapa se mexem pouco ao rolar; o texto corrido não", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await expect(page.locator("html")).toHaveClass(/lenis/);
    expect(await deslocamento(page, ".who")).toBe(0); // zero no carregamento: nada muda de lugar
    expect(await deslocamento(page, ".place-art")).toBe(0);
    await rolarComRoda(page, 300);
    const foto = await deslocamento(page, ".who");
    const mapa = await deslocamento(page, ".place-art");
    expect(foto).toBeGreaterThan(5);
    expect(foto).toBeLessThanOrEqual(36);
    expect(mapa).toBeGreaterThan(foto); // camadas com velocidades diferentes
    expect(mapa).toBeLessThanOrEqual(36);
    // Texto corrido parado (a propriedade translate nem existe neles).
    for (const sel of [".lead", "#carmine .carmine-body p", "#experiencia li p", "h1"]) expect(await deslocamento(page, sel)).toBe(0);
    // Volta ao zero ao voltar ao topo.
    await rolarComRoda(page, -300);
    await expect.poll(() => deslocamento(page, ".who")).toBe(0);
  });

  test("os títulos das seções andam um pouco ao rolar, dentro do limite", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await expect(page.locator("html")).toHaveClass(/lenis/);
    await page.locator("#experiencia").scrollIntoViewIfNeeded();
    await rolarComRoda(page, 120);
    const t = await deslocamento(page, "#experiencia h2");
    expect(Math.abs(t)).toBeLessThanOrEqual(36);
    const camadas = await page.locator("[data-parallax]").count();
    expect(camadas).toBeGreaterThanOrEqual(8); // foto, mapa e os títulos
  });

  test("com prefers-reduced-motion, o parallax fica desligado", async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: "reduce", viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    await page.goto("/");
    await page.evaluate(() => window.scrollTo(0, 400));
    await page.waitForTimeout(300);
    expect(await deslocamento(page, ".who")).toBe(0);
    expect(await deslocamento(page, ".place-art")).toBe(0);
    await ctx.close();
  });

  test("no celular (toque) o parallax fica desligado, sem jank", async ({ browser }) => {
    const ctx = await browser.newContext({ hasTouch: true, isMobile: true, viewport: { width: 375, height: 667 }, reducedMotion: "no-preference" });
    const page = await ctx.newPage();
    await page.goto("/");
    await page.evaluate(() => window.scrollTo(0, 300));
    await page.waitForTimeout(300);
    expect(await deslocamento(page, ".who")).toBe(0);
    await ctx.close();
  });

  test("a troca de idioma mantém o parallax funcionando no conteúdo novo", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await expect(page.locator("html")).toHaveClass(/lenis/);
    await page.getByRole("button", { name: /^Idioma/ }).click();
    await page.getByRole("menuitemradio", { name: "English" }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Software Engineer");
    await rolarComRoda(page, 300);
    expect(await deslocamento(page, ".who")).toBeGreaterThan(5);
  });
});
