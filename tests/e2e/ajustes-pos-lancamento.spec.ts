import { expect, test } from "@playwright/test";
import { rotasTexto, type RotaTexto } from "./textos";

// Issue #18: botões sem fundo em repouso, hero sem legenda, logo da TechEduConnect inteiro.
const TRANSPARENTE = "rgba(0, 0, 0, 0)";

for (const path of ["/", "/en"] as RotaTexto[]) {
  const t = rotasTexto[path];
  test.describe(`ajustes em ${path}`, () => {
    test("tema e língua: sem fundo em repouso; fundo no hover e no foco; foco visível", async ({ page }) => {
      await page.goto(path);
      const alvos = [page.getByRole("button", { name: t.tema }), page.getByRole("link", { name: t.outraLingua })];
      for (const alvo of alvos) {
        await expect(alvo).toHaveCSS("background-color", TRANSPARENTE);
        await alvo.hover();
        await expect(alvo).not.toHaveCSS("background-color", TRANSPARENTE);
        await page.mouse.move(2, 2);
        await expect(alvo).toHaveCSS("background-color", TRANSPARENTE);
      }
      // Foco pelo teclado: Tab chega em cada um (assinatura não é focável), com fundo e contorno.
      await page.keyboard.press("Tab");
      await expect(alvos[1]).toBeFocused();
      await expect(alvos[1]).not.toHaveCSS("background-color", TRANSPARENTE);
      expect(await alvos[1].evaluate((el) => getComputedStyle(el).outlineStyle)).not.toBe("none");
      await page.keyboard.press("Tab");
      await expect(alvos[0]).toBeFocused();
      await expect(alvos[0]).not.toHaveCSS("background-color", TRANSPARENTE);
      expect(await alvos[0].evaluate((el) => getComputedStyle(el).outlineStyle)).not.toBe("none");
    });

    test("copiar e-mail: sem fundo em repouso; fundo no hover e no foco do teclado", async ({ page }) => {
      await page.goto(path);
      const copiar = page.getByRole("button", { name: t.copiar });
      await copiar.scrollIntoViewIfNeeded();
      await expect(copiar).toHaveCSS("background-color", TRANSPARENTE);
      await copiar.hover();
      await expect(copiar).not.toHaveCSS("background-color", TRANSPARENTE);
      await page.mouse.move(2, 2);
      await expect(copiar).toHaveCSS("background-color", TRANSPARENTE);
      // Foco pelo teclado (:focus-visible): sai e volta com Shift+Tab e Tab.
      await copiar.focus();
      await page.keyboard.press("Shift+Tab");
      await page.keyboard.press("Tab");
      await expect(copiar).toBeFocused();
      await expect(copiar).not.toHaveCSS("background-color", TRANSPARENTE);
    });

    test("sem nome nem cidade embaixo da foto; o lugar (mapa, cidade e hora) embaixo da frase, do conteúdo", async ({ page }) => {
      await page.goto(path);
      await expect(page.locator(".who figcaption")).toHaveCount(0);
      await expect(page.locator(".who")).toHaveText("");
      const lugar = page.locator(".hero .place");
      await expect(lugar.locator(".place-city")).toHaveText(t.local);
      const lead = (await page.locator(".hero .lead").boundingBox())!;
      const box = (await lugar.boundingBox())!;
      expect(box.y).toBeGreaterThanOrEqual(lead.y + lead.height - 1);
    });

    test("o logo da TechEduConnect aparece inteiro, sem corte", async ({ page }) => {
      await page.goto(path);
      const img = page.locator("#experiencia img.entry-logo").first();
      await expect(img).toBeVisible();
      const src = await img.evaluate((el: HTMLImageElement) => el.currentSrc);
      const svg = await (await page.request.get(src)).text();
      // Todo o desenho cabe no viewBox: mede cada traço no navegador.
      const dentro = await page.evaluate((markup) => {
        const host = document.createElement("div");
        host.innerHTML = markup;
        document.body.append(host);
        const el = host.querySelector("svg")!;
        const [x, y, w, h] = el.getAttribute("viewBox")!.split(" ").map(Number);
        const caixas = [...el.querySelectorAll("path")].map((p) => p.getBBox());
        host.remove();
        return caixas.length > 0 && caixas.every((b) => b.x >= x && b.y >= y && b.x + b.width <= x + w && b.y + b.height <= y + h);
      }, svg);
      expect(dentro).toBe(true);
    });
  });
}
