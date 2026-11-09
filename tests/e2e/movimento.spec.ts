import { expect, test } from "@playwright/test";

for (const path of ["/", "/en"]) {
  test.describe(`movimento em ${path}`, () => {
    test("com prefers-reduced-motion: reduce, a entrada do hero não anima", async ({ browser }) => {
      const ctx = await browser.newContext({ reducedMotion: "reduce" });
      const page = await ctx.newPage();
      await page.goto(path);
      for (const sel of [".who", "h1", ".lead"]) {
        const el = page.locator(sel).first();
        await expect(el).toHaveCSS("animation-name", "none");
        await expect(el).toHaveCSS("opacity", "1");
      }
      expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
      await ctx.close();
    });

    test("sem preferência, a entrada do hero anima (controle)", async ({ browser }) => {
      const ctx = await browser.newContext({ reducedMotion: "no-preference" });
      const page = await ctx.newPage();
      await page.goto(path);
      await expect(page.locator("h1")).toHaveCSS("animation-name", "rise");
      await ctx.close();
    });
  });
}
