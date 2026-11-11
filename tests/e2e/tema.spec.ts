import { expect, test } from "./base";
import { rotasTexto } from "./textos";

const rotas = ["/", "/en", "/es"] as const;

for (const path of rotas) {
  const t = rotasTexto[path];
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
      const botao = page.getByRole("button", { name: t.tema });
      await expect(botao).toHaveAttribute("aria-pressed", "false");
      await botao.click();
      await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
      await expect(botao).toHaveAttribute("aria-pressed", "true");
      await botao.click();
      await expect(page.locator("html")).not.toHaveAttribute("data-theme", "dark");
    });

    test("a escolha sobrevive a um recarregamento, sem piscar", async ({ page }) => {
      await page.goto(path);
      await page.getByRole("button", { name: t.tema }).click();
      await page.reload({ waitUntil: "commit" });
      // Antes de qualquer script do React: o atributo já está no <html> em domcontentloaded.
      await page.waitForLoadState("domcontentloaded");
      await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
      const early = await page.evaluate(() => document.documentElement.dataset.theme);
      expect(early).toBe("dark");
      // O que o visitante vê: já escuro desde o início, sem fade do claro (transição em andamento daria outro valor).
      const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
      expect(bg).toBe("rgb(11, 11, 12)");
    });

    test("o escuro vale também na outra rota", async ({ page }) => {
      await page.goto(path);
      await page.getByRole("button", { name: t.tema }).click();
      await page.goto(path === "/" ? "/en" : "/");
      await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    });
  });
}
