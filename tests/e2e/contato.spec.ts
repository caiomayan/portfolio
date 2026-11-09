import { expect, test } from "@playwright/test";

const rotas = [
  { path: "/", pdf: "/caio-mayan-curriculo.pdf" },
  { path: "/en", pdf: "/caio-mayan-resume.pdf" },
];

for (const { path, pdf } of rotas) {
  test.describe(`contato em ${path}`, () => {
    test("links certos pra e-mail, LinkedIn e GitHub", async ({ page }) => {
      await page.goto(path);
      await expect(page.locator('a[href="mailto:mail@caiomayan.com"]')).toBeVisible();
      await expect(page.locator('a[href="https://www.linkedin.com/in/caiomayan/"]')).toBeVisible();
      await expect(page.locator('a[href="https://github.com/caiomayan"]')).toBeVisible();
      expect(await page.locator("a[href^='tel:']").count()).toBe(0);
    });

    test("o currículo é o PDF da língua da página e responde 200", async ({ page, request }) => {
      await page.goto(path);
      const link = page.locator(`a[href="${pdf}"]`);
      await expect(link).toBeVisible();
      await expect(page.locator("a[href$='.pdf']")).toHaveCount(1);
      const res = await request.get(pdf);
      expect(res.status()).toBe(200);
      expect(res.headers()["content-type"]).toContain("application/pdf");
    });

    test("copiar coloca o e-mail na área de transferência e confirma", async ({ browser }) => {
      const ctx = await browser.newContext({ permissions: ["clipboard-read", "clipboard-write"] });
      const page = await ctx.newPage();
      await page.goto(path);
      const botao = page.getByRole("button", { name: "Copiar e-mail" });
      await expect(botao).toBeVisible();
      await botao.click();
      expect(await page.evaluate(() => navigator.clipboard.readText())).toBe("mail@caiomayan.com");
      // Confirmação visual e anunciada por leitor de tela.
      await expect(page.getByRole("status")).toHaveText("Copiado");
      await expect(botao).toHaveAttribute("data-copied", "true");
      await ctx.close();
    });

    test("o botão de copiar tem foco visível pelo teclado", async ({ page }) => {
      await page.goto(path);
      const botao = page.getByRole("button", { name: "Copiar e-mail" });
      await botao.focus();
      await expect(botao).toBeFocused();
      const outline = await botao.evaluate((el) => getComputedStyle(el).outlineStyle);
      expect(outline).not.toBe("none");
    });

    test("telefone não aparece em lugar nenhum", async ({ page }) => {
      await page.goto(path);
      const text = await page.locator("body").innerText();
      expect(text).not.toMatch(/\(?\d{2}\)?\s?9?\d{4}[-\s]?\d{4}/);
    });

    test("com prefers-reduced-motion, os ícones não animam", async ({ browser }) => {
      const ctx = await browser.newContext({ reducedMotion: "reduce", permissions: ["clipboard-read", "clipboard-write"] });
      const page = await ctx.newPage();
      await page.goto(path);
      await page.getByRole("link", { name: /LinkedIn/ }).hover();
      await page.getByRole("button", { name: "Copiar e-mail" }).click();
      await expect(page.getByRole("status")).toHaveText("Copiado");
      // Nenhuma animação de movimento em curso nos ícones.
      const running = await page.evaluate(
        () => document.getAnimations().filter((a) => a.playState === "running").length,
      );
      expect(running).toBe(0);
      await ctx.close();
    });
  });
}
