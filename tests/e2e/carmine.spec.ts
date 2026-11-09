import { expect, test } from "@playwright/test";

for (const path of ["/", "/en"]) {
  test.describe(`seção Carmine em ${path}`, () => {
    test("aparece depois da apresentação, com o texto do copy deck", async ({ page }) => {
      await page.goto(path);
      const secao = page.locator("#carmine");
      await expect(secao.getByRole("heading", { level: 2, name: "Carmine" })).toBeVisible();
      await expect(secao.getByText("SaaS para jogadores e times competitivos de Counter-Strike 2.")).toBeVisible();
      await expect(secao.getByText("Em desenvolvimento, lançamento previsto para 2027")).toBeVisible();
      await expect(secao.getByText(/agentes de IA que abrem issues e pull requests/)).toBeVisible();

      const hero = await page.locator(".hero").boundingBox();
      const sec = await secao.boundingBox();
      expect(sec!.y).toBeGreaterThan(hero!.y + hero!.height - 1);
    });

    test("lista a stack, com logo só onde há logo oficial", async ({ page }) => {
      await page.goto(path);
      const itens = page.locator("#carmine .stack li");
      await expect(itens).toHaveCount(6);
      await expect(itens.nth(0)).toContainText("Nest.js");
      await expect(itens.nth(3)).toContainText("CounterStrikeSharp");
      await expect(itens.nth(3).locator("img")).toHaveCount(0);
      for (const i of [0, 1, 2, 4, 5]) await expect(itens.nth(i).locator("img")).toHaveCount(1);
    });

    test("links apontam pro site e pro repositório", async ({ page }) => {
      await page.goto(path);
      await expect(page.locator("#carmine").getByRole("link", { name: /stcarmine\.com/ })).toHaveAttribute("href", "https://stcarmine.com");
      await expect(page.locator("#carmine").getByRole("link", { name: /Repositório/ })).toHaveAttribute(
        "href",
        "https://github.com/caiomayan/carmine",
      );
    });

    test("abas trocam o print, com mouse e com teclado", async ({ page }) => {
      await page.goto(path);
      const abas = page.locator("#carmine").getByRole("tab");
      await expect(abas).toHaveCount(2);
      const painel = page.locator("#carmine").getByRole("tabpanel");
      await expect(abas.nth(0)).toHaveAttribute("aria-selected", "true");
      await expect(painel.getByRole("img")).toHaveAttribute("alt", /Inventário/);

      await abas.nth(1).click();
      await expect(abas.nth(1)).toHaveAttribute("aria-selected", "true");
      await expect(painel.getByRole("img")).toHaveAttribute("alt", /Ranking/);

      await abas.nth(1).focus();
      await page.keyboard.press("ArrowLeft");
      await expect(abas.nth(0)).toBeFocused();
      await expect(abas.nth(0)).toHaveAttribute("aria-selected", "true");
      await expect(painel.getByRole("img")).toHaveAttribute("alt", /Inventário/);
      await page.keyboard.press("End");
      await expect(abas.nth(1)).toHaveAttribute("aria-selected", "true");
      await page.keyboard.press("Home");
      await expect(abas.nth(0)).toHaveAttribute("aria-selected", "true");
    });

    test("o print carrega e fica em tamanho moderado dentro da coluna", async ({ page }) => {
      await page.goto(path);
      const img = page.locator("#carmine").getByRole("tabpanel").getByRole("img");
      await img.scrollIntoViewIfNeeded();
      await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);
      const box = await img.boundingBox();
      expect(box!.width).toBeLessThanOrEqual(720);
      expect(box!.height).toBeLessThanOrEqual(450);
    });

    test("não rola na horizontal a 375 px", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto(path);
      const { sw, cw } = await page.evaluate(() => ({
        sw: document.documentElement.scrollWidth,
        cw: document.documentElement.clientWidth,
      }));
      expect(sw).toBeLessThanOrEqual(cw);
    });
  });
}
