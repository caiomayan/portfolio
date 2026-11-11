import { expect, test } from "@playwright/test";
import { rotasTexto } from "./textos";

const rotas = [
  { path: "/", lang: "pt-BR" },
  { path: "/en", lang: "en" },
  { path: "/es", lang: "es" },
] as const;

for (const { path, lang } of rotas) {
  const t = rotasTexto[path];
  test.describe(`rota ${path}`, () => {
    test("responde 200 com o lang certo", async ({ page }) => {
      const res = await page.goto(path);
      expect(res?.status()).toBe(200);
      await expect(page.locator("html")).toHaveAttribute("lang", lang);
    });

    test("mostra foto inteira, nome, título e frase de abertura", async ({ page }) => {
      await page.goto(path);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(t.titulo);
      await expect(page.getByText(t.lead)).toBeVisible();
      await expect(page.getByRole("img", { name: "Caio Mayan", exact: true })).toBeVisible();
      const foto = page.getByRole("img", { name: t.foto });
      await expect(foto).toBeVisible();
      const box = await foto.boundingBox();
      expect(box!.width).toBeCloseTo(box!.height, 0); // quadrada, sem corte
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

test("rota inexistente responde 404", async ({ page }) => {
  const res = await page.goto("/nao-existe");
  expect(res?.status()).toBe(404);
});
