import { expect, test } from "@playwright/test";

// Assinatura e logos precisam continuar legíveis no tema escuro (logos pretos invertidos, o colorido do Valkey intacto).
function luminance(rgb: string): number {
  const [r, g, b] = (rgb.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number);
  const f = (c: number) => ((c /= 255) <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}
const contrast = (a: string, b: string) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

for (const path of ["/", "/en"]) {
  test.describe(`${path} no tema escuro`, () => {
    test.beforeEach(async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.addInitScript(() => localStorage.setItem("theme", "dark"));
      await page.goto(path);
      await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    });

    test("a assinatura contrasta com o fundo (3:1 ou mais)", async ({ page }) => {
      const sig = page.locator("svg.signature");
      await expect(sig).toBeVisible();
      const cor = await sig.evaluate((el) => getComputedStyle(el).color);
      const fundo = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
      expect(contrast(cor, fundo)).toBeGreaterThanOrEqual(3);
    });

    test("logos monocromáticos da stack invertem; o do Valkey (colorido) não", async ({ page }) => {
      const logos = page.locator("#carmine .stack img");
      await expect(logos).toHaveCount(5);
      const filtros = await logos.evaluateAll((els) =>
        els.map((el) => ({ cor: el.classList.contains("color"), filter: getComputedStyle(el).filter })),
      );
      expect(filtros.filter((f) => f.cor)).toHaveLength(1);
      for (const f of filtros) {
        if (f.cor) expect(f.filter).toContain("brightness(0)"); // o colorido vai pro tom suave, sem o matiz
        else expect(f.filter).toContain("invert");
      }
    });

    test("logos pretos de experiência e formação invertem a luminosidade; o verde do Hospital não", async ({ page }) => {
      const hospital = page.locator("#experiencia img.entry-logo[data-colored]");
      await expect(hospital).toHaveCount(1);
      await expect(hospital).toHaveCSS("filter", "none");
      const logos = page.locator("#experiencia img.entry-logo:not([data-colored]), #formacao img.entry-logo:not([data-colored])");
      expect(await logos.count()).toBeGreaterThan(0);
      for (const f of await logos.evaluateAll((els) => els.map((el) => getComputedStyle(el).filter))) {
        expect(f).toContain("invert");
      }
    });
  });
}
