import { expect, test, type Page } from "./base";
import { rotasTexto } from "./textos";

// Revisão final da #29 (PR #33): estrutura (main), teclado nas linhas de ícones, ordem no celular, largura em telas estreitas,
// falha ao copiar o e-mail e colunas dos ícones no celular.
const rotas = ["/", "/en", "/es"] as const;

const semRolagemLateral = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);

for (const path of rotas) {
  const t = rotasTexto[path];
  test.describe(`revisão final em ${path}`, () => {
    test("o <main> envolve todas as seções; header e footer ficam fora; a primeira tela é uma seção", async ({ page }) => {
      await page.goto(path);
      await expect(page.locator("main")).toHaveCount(1);
      await expect(page.locator("main section")).toHaveCount(await page.locator("section").count());
      await expect(page.locator("main section.hero h1")).toHaveText(t.titulo);
      expect(await page.locator("main header, main footer").count()).toBe(0);
      await expect(page.locator("body > header")).toHaveCount(1);
      await expect(page.locator("body > footer")).toHaveCount(1);
      await expect(page.locator("main #idiomas")).toHaveCount(1);
      await expect(page.locator("main #contato")).toHaveCount(0);
    });

    test("cada linha de ícones é uma parada de Tab; setas, Home e End andam entre os ícones e abrem o tooltip", async ({ page }) => {
      await page.goto(path);
      const linhas = page.locator(".icon-row .stack");
      const n = await linhas.count();
      expect(n).toBe(3);
      for (let i = 0; i < n; i++) {
        await expect(linhas.nth(i).locator('.stack-icon[tabindex="0"]')).toHaveCount(1);
        expect(await linhas.nth(i).locator('.stack-icon:not([tabindex="0"])').evaluateAll((els) => els.every((e) => e.getAttribute("tabindex") === "-1"))).toBe(true);
      }
      const carmine = page.locator("#carmine .stack");
      const icones = carmine.locator(".stack-icon");
      const nomes = await icones.evaluateAll((els) => els.map((e) => e.getAttribute("aria-label")));
      await icones.first().focus();
      await expect(page.locator("#carmine .tip")).toHaveText(nomes[0]!);
      await page.keyboard.press("ArrowRight");
      await expect(icones.nth(1)).toBeFocused();
      await expect(page.locator("#carmine .tip")).toHaveText(nomes[1]!);
      await expect(icones.nth(1)).toHaveAttribute("tabindex", "0");
      await expect(icones.first()).toHaveAttribute("tabindex", "-1");
      await page.keyboard.press("End");
      await expect(icones.last()).toBeFocused();
      await page.keyboard.press("ArrowRight"); // no fim, fica
      await expect(icones.last()).toBeFocused();
      await page.keyboard.press("Home");
      await expect(icones.first()).toBeFocused();
      await page.keyboard.press("ArrowLeft");
      await expect(icones.first()).toBeFocused();
      // Tab sai da linha de uma vez (não passa por cada ícone).
      await icones.nth(2).focus();
      await page.keyboard.press("Tab");
      expect(await page.evaluate(() => document.activeElement?.closest(".stack"))).toBeNull();
    });

    for (const width of [320, 375]) {
      test(`${width} px: sem rolagem lateral, nem com texto a 200 %`, async ({ page }) => {
        await page.setViewportSize({ width, height: 800 });
        await page.goto(path);
        expect(await semRolagemLateral(page)).toBe(true);
        await page.addStyleTag({ content: "html { font-size: 200% !important; }" });
        expect(await semRolagemLateral(page)).toBe(true);
        const topo = await page.locator(".top").evaluate((el) => {
          const r = el.getBoundingClientRect();
          return [...el.querySelectorAll(".signature-mark, .theme-toggle, .lang-button")].every((c) => c.getBoundingClientRect().right <= r.right + 0.5);
        });
        expect(topo).toBe(true);
        expect(await page.locator("h1").evaluate((h) => h.scrollWidth <= h.clientWidth)).toBe(true);
      });
    }

    test("celular: o período vem logo depois do título e antes das linhas e dos ícones; no desktop continua à direita", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 800 });
      await page.goto(path);
      for (const secao of ["#experiencia", "#formacao"]) {
        for (const entrada of await page.locator(`${secao} .entry`).all()) {
          const [main, periodo, corpo, filhos] = await Promise.all(
            [".entry-main", ".entry-period", ".entry-body", ".entry-children"].map(async (s) => ((await entrada.locator(s).count()) ? entrada.locator(s).first().boundingBox() : null)),
          );
          expect(periodo!.y).toBeGreaterThanOrEqual(main!.y + main!.height - 1);
          if (corpo) expect(corpo.y).toBeGreaterThanOrEqual(periodo!.y + periodo!.height - 1);
          if (corpo && filhos) expect(filhos.y).toBeGreaterThanOrEqual(corpo.y + corpo.height - 1);
        }
      }
      await page.setViewportSize({ width: 1440, height: 900 });
      for (const entrada of await page.locator("#experiencia .entry, #formacao .entry").all()) {
        const [main, periodo] = await Promise.all([".entry-main", ".entry-period"].map((s) => entrada.locator(s).first().boundingBox()));
        expect(periodo!.x).toBeGreaterThan(main!.x + main!.width);
        expect(Math.abs(periodo!.y - main!.y)).toBeLessThan(8);
      }
    });

    test("celular: os ícones do curso quebram sem deixar um ícone sozinho na última linha", async ({ page }) => {
      for (const width of [320, 360, 375, 414, 768]) {
        await page.setViewportSize({ width, height: 800 });
        await page.goto(path);
        for (const linha of await page.locator(".icon-row .stack").all()) {
          const tops = await linha.locator("li").evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().top)));
          const porLinha = [...new Set(tops)].map((y) => tops.filter((v) => v === y).length);
          if (porLinha.length > 1) expect(porLinha[porLinha.length - 1], `${width}px: ${porLinha}`).toBeGreaterThan(1);
        }
      }
    });
  });
}
