import { expect, test } from "@playwright/test";

const rotas = ["/", "/en"];

for (const path of rotas) {
  test.describe(`tema em ${path}`, () => {
    test("abre no claro, mesmo com o sistema no escuro", async ({ browser }) => {
      const ctx = await browser.newContext({ colorScheme: "dark" });
      const page = await ctx.newPage();
      await page.goto(path);
      await expect(page.locator("html")).not.toHaveAttribute("data-theme", "dark");
      const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
      expect(bg).not.toBe("rgb(0, 0, 0)");
      await ctx.close();
    });

    test("o botão troca pro escuro e de volta", async ({ page }) => {
      await page.goto(path);
      const botao = page.getByRole("button", { name: "Tema escuro" });
      await expect(botao).toHaveAttribute("aria-pressed", "false");
      await botao.click();
      await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
      await expect(botao).toHaveAttribute("aria-pressed", "true");
      await botao.click();
      await expect(page.locator("html")).not.toHaveAttribute("data-theme", "dark");
    });

    test("a escolha sobrevive a um recarregamento, sem piscar", async ({ page }) => {
      await page.goto(path);
      await page.getByRole("button", { name: "Tema escuro" }).click();
      await page.reload({ waitUntil: "commit" });
      // Antes de qualquer script do React: o atributo já está no <html> em domcontentloaded.
      await page.waitForLoadState("domcontentloaded");
      await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
      const early = await page.evaluate(() => document.documentElement.dataset.theme);
      expect(early).toBe("dark");
    });

    test("o escuro vale também na outra rota", async ({ page }) => {
      await page.goto(path);
      await page.getByRole("button", { name: "Tema escuro" }).click();
      await page.goto(path === "/" ? "/en" : "/");
      await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    });
  });
}
