import { expect, test } from "@playwright/test";
import { rotasTexto, type RotaTexto } from "./textos";

// Texto: docs/copy-deck.md (seções Experiência e Formação).
for (const path of ["/", "/en"] as RotaTexto[]) {
  const t = rotasTexto[path];
  test.describe(`experiência e formação em ${path}`, () => {
    test("a página inteira segue a ordem: apresentação, Carmine, experiência, formação, contato", async ({ page }) => {
      await page.goto(path);
      const tops = await Promise.all(
        [".hero", "#carmine", "#experiencia", "#formacao", ".contact"].map(async (sel) => (await page.locator(sel).boundingBox())!.y),
      );
      expect(tops).toEqual([...tops].sort((a, b) => a - b));
      expect(new Set(tops).size).toBe(5);
    });

    test("experiência: TechEduConnect com as três linhas, depois o Hospital em uma linha", async ({ page }) => {
      await page.goto(path);
      const sec = page.locator("section", { has: page.getByRole("heading", { name: t.exp.heading }) });
      await expect(sec.getByText(t.exp.cargo)).toBeVisible();
      await expect(sec.getByText(t.exp.periodo)).toBeVisible();
      await expect(sec.getByText(t.exp.l1)).toBeVisible();
      await expect(sec.getByText(t.exp.l2)).toBeVisible();
      await expect(sec.getByText(t.exp.l3)).toBeVisible();
      await expect(sec.getByText("Hospital Napoleão Laureano")).toBeVisible();
      await expect(sec.getByText(t.exp.hospPeriodo)).toBeVisible();
      await expect(sec.getByText(t.exp.hospCargo)).toBeVisible();
      // ordem: TechEduConnect antes do Hospital
      const text = await sec.innerText();
      expect(text.indexOf("TechEduConnect")).toBeLessThan(text.indexOf("Hospital Napoleão Laureano"));
    });

    test("formação: IFPB, monitoria e inglês C2", async ({ page }) => {
      await page.goto(path);
      const sec = page.locator("section", { has: page.getByRole("heading", { name: t.form.heading }) });
      await expect(sec.getByText(t.form.curso)).toBeVisible();
      await expect(sec.getByText(t.form.inst)).toBeVisible();
      await expect(sec.getByText(t.form.periodo)).toBeVisible();
      await expect(sec.getByText(t.form.monitor)).toBeVisible();
      await expect(sec.getByText(t.form.semestre)).toBeVisible();
      await expect(sec.getByText(t.form.ingles)).toBeVisible();
      await expect(sec.getByText("C2, EF SET")).toBeVisible();
    });

    test("logos reais da TechEduConnect e do IFPB carregam; o Hospital só tem o nome", async ({ page }) => {
      await page.goto(path);
      const exp = page.locator("section", { has: page.getByRole("heading", { name: t.exp.heading }) });
      const form = page.locator("section", { has: page.getByRole("heading", { name: t.form.heading }) });
      const logos = [exp.locator("img"), form.locator("img")];
      await expect(exp.locator("img")).toHaveCount(1);
      await expect(form.locator("img")).toHaveCount(1);
      for (const l of logos) {
        await expect(l).toBeVisible();
        expect(await l.evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth > 0)).toBe(true);
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
