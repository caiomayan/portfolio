import { expect, test } from "@playwright/test";
import { rotasTexto, type RotaTexto } from "./textos";

for (const path of ["/", "/en", "/es"] as RotaTexto[]) {
  const t = rotasTexto[path].carmine;
  test.describe(`seção Carmine em ${path}`, () => {
    test("aparece depois da apresentação, com o texto do copy deck", async ({ page }) => {
      await page.goto(path);
      const secao = page.locator("#carmine");
      await expect(secao.getByRole("heading", { level: 2, name: "Carmine" })).toBeVisible();
      await expect(secao.getByText(t.what)).toBeVisible();
      await expect(secao.getByText(t.status)).toBeVisible();
      await expect(secao.getByText(t.how)).toBeVisible();

      const hero = await page.locator(".hero").boundingBox();
      const sec = await secao.boundingBox();
      expect(sec!.y).toBeGreaterThan(hero!.y + hero!.height - 1);
    });

    test("lista a stack só com ícones, lado a lado, sem nome nem função na tela", async ({ page }) => {
      await page.goto(path);
      const itens = page.locator("#carmine .stack li");
      await expect(itens).toHaveCount(6);
      const nomes = ["Nest.js", "Next.js", "Valkey", "CounterStrikeSharp", "AWS EC2", "Oracle Cloud"];
      for (const [i, nome] of nomes.entries()) {
        const item = itens.nth(i);
        await expect(item).toHaveText(""); // nada escrito: nem nome, nem função
        await expect(item.getByRole("img", { name: nome })).toBeVisible();
        expect(await item.locator("img, svg.fallback-icon").count()).toBe(1); // logo OU ícone de reserva
        await expect(item.locator("img, .stack-logo-empty").first()).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
      }
      // CounterStrikeSharp não tem logo oficial: ícone de reserva decorativo.
      await expect(itens.nth(3).locator("svg.fallback-icon")).toHaveAttribute("aria-hidden", "true");
      // Lado a lado: mesma linha, da esquerda pra direita.
      const caixas = await itens.evaluateAll((els) => els.map((el) => el.getBoundingClientRect()));
      for (const b of caixas) expect(Math.abs(b.top - caixas[0].top)).toBeLessThan(1);
      for (let i = 1; i < caixas.length; i++) expect(caixas[i].left).toBeGreaterThan(caixas[i - 1].left);
      // A função de cada tecnologia saiu do conteúdo.
      expect(await page.locator("#carmine").innerText()).not.toMatch(/backend|frontend|Ampere|cache|queues|filas/i);
    });

    test("o nome da tecnologia aparece em tooltip no hover e no foco, e some com Esc", async ({ page }) => {
      await page.goto(path);
      const itens = page.locator("#carmine .stack li");
      const tip = page.locator("#carmine .tip");
      await expect(tip).toHaveCount(0);
      await itens.nth(3).hover();
      await expect(tip).toHaveText("CounterStrikeSharp");
      await expect(tip).toHaveAttribute("aria-hidden", "true");
      await page.mouse.move(2, 2);
      await expect(tip).toHaveCount(0);
      // Teclado: o ícone é focável e abre o tooltip.
      await itens.nth(0).getByRole("img").focus();
      await expect(tip).toHaveText("Nest.js");
      await page.keyboard.press("Escape");
      await expect(tip).toHaveCount(0);
      await itens.nth(1).getByRole("img").focus();
      await expect(tip).toHaveText("Next.js");
    });

    test("sem prints, abas nem legenda; o logo do Carmine continua", async ({ page }) => {
      await page.goto(path);
      const secao = page.locator("#carmine");
      await expect(secao.getByRole("tab")).toHaveCount(0);
      await expect(secao.locator("figure, figcaption, [role=tabpanel]")).toHaveCount(0);
      await expect(secao.locator(".carmine-head h2 img")).toHaveCount(1);
      expect(await secao.innerText()).not.toMatch(/no ar\.|Screenshots from|Telas do|Carmine screens/);
    });

    test("links apontam pro site e pro repositório", async ({ page }) => {
      await page.goto(path);
      await expect(page.locator("#carmine").getByRole("link", { name: /stcarmine\.com/ })).toHaveAttribute("href", "https://stcarmine.com");
      await expect(page.locator("#carmine").getByRole("link", { name: t.repo })).toHaveAttribute(
        "href",
        "https://github.com/caiomayan/carmine",
      );
    });

    test("os logos da stack carregam", async ({ page }) => {
      await page.goto(path);
      const logos = page.locator("#carmine .stack img");
      await expect(logos).toHaveCount(5);
      await logos.first().scrollIntoViewIfNeeded();
      for (let i = 0; i < 5; i++) {
        await expect.poll(() => logos.nth(i).evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);
      }
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
