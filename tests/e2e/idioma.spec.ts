import { expect, test } from "@playwright/test";
import { rotasTexto } from "./textos";

// Issue #7: duas línguas, troca entre rotas equivalentes, hreflang, sem redirecionamento por língua do navegador.
test.describe("versão em inglês", () => {
  test("o botão de língua leva à rota equivalente, nos dois sentidos", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: rotasTexto["/"].outraLingua }).click();
    await expect(page).toHaveURL(/\/en$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Software Engineer");

    await page.getByRole("link", { name: rotasTexto["/en"].outraLingua }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Engenheiro de Software");
  });

  for (const path of ["/", "/en"] as const) {
    test(`${path} declara hreflang pras duas rotas`, async ({ page }) => {
      await page.goto(path);
      const alt = (l: string) => page.locator(`link[rel="alternate"][hreflang="${l}"]`);
      await expect(alt("pt-BR")).toHaveAttribute("href", "https://caiomayan.com");
      await expect(alt("en")).toHaveAttribute("href", "https://caiomayan.com/en");
    });
  }

  test("o botão de língua tem alvo de toque de 44 px", async ({ page }) => {
    await page.goto("/");
    const box = await page.getByRole("link", { name: "English" }).boundingBox();
    expect(box!.height).toBeGreaterThanOrEqual(44);
  });

  test("não redireciona pela língua do navegador", async ({ browser }) => {
    for (const [locale, path] of [["en-US", "/"], ["pt-BR", "/en"]] as const) {
      const ctx = await browser.newContext({ locale, extraHTTPHeaders: { "Accept-Language": locale } });
      const page = await ctx.newPage();
      const res = await page.goto(path);
      expect(res?.status()).toBe(200);
      expect(res?.request().redirectedFrom()).toBeNull();
      expect(new URL(page.url()).pathname).toBe(path);
      await ctx.close();
    }
  });

  test("a rota em inglês não tem texto em português", async ({ page }) => {
    await page.goto("/en");
    const text = await page.locator("body").innerText();
    for (const pt of ["Engenheiro", "Experiência", "Formação", "Contato", "Copiar", "Currículo", "Projeto pessoal", "Em desenvolvimento"]) {
      expect(text).not.toContain(pt);
    }
  });
});
