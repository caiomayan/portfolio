import { expect, test } from "@playwright/test";
import { rotasTexto, type RotaTexto } from "./textos";

// Texto: docs/copy-deck.md (seções Experiência e Formação).
for (const path of ["/", "/en"] as RotaTexto[]) {
  const t = rotasTexto[path];
  test.describe(`experiência e formação em ${path}`, () => {
    test("a página inteira segue a ordem: apresentação, Carmine, experiência, formação, fundamentos, contato", async ({ page }) => {
      await page.goto(path);
      const tops = await Promise.all(
        [".hero", "#carmine", "#experiencia", "#formacao", "#fundamentos", ".contact"].map(async (sel) => (await page.locator(sel).boundingBox())!.y),
      );
      expect(tops).toEqual([...tops].sort((a, b) => a - b));
      expect(new Set(tops).size).toBe(6);
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

    test("formação: IFPB com descrição, monitoria como subitem subordinado, sem inglês", async ({ page }) => {
      await page.goto(path);
      const sec = page.locator("section", { has: page.getByRole("heading", { name: t.form.heading }) });
      await expect(sec.getByText(t.form.curso)).toBeVisible();
      await expect(sec.getByText(t.form.inst)).toBeVisible();
      await expect(sec.getByText(t.form.periodo)).toBeVisible();
      await expect(sec.getByText(t.form.monitoria, { exact: true })).toBeVisible();
      await expect(sec.getByText(t.form.monitor)).toBeVisible();
      await expect(sec.getByText(t.form.semestre)).toBeVisible();
      await expect(sec.getByText(t.form.descricao)).toBeVisible();
      expect(await sec.innerText()).not.toMatch(new RegExp(`${t.form.ingles}|EF SET|atividade do curso|course activity`, "i"));
      // Hierarquia: a monitoria é filha do curso (dentro da mesma linha), recuada, menor e depois da descrição.
      await expect(page.locator("#formacao .entry")).toHaveCount(1);
      const curso = page.locator("#formacao h3");
      const filho = page.locator("#formacao .entry-child-title");
      await expect(filho).toHaveCount(1);
      await expect(page.locator("#formacao .entry-child")).toHaveCount(1);
      const [bc, bf, bd] = await Promise.all([curso.boundingBox(), filho.boundingBox(), sec.getByText(t.form.descricao).boundingBox()]);
      // Mesma borda esquerda do texto do curso (não um recuo solto), com o ícone de hierarquia à esquerda dela.
      const texto = (await page.locator("#formacao .entry-child-text").boundingBox())!;
      expect(Math.abs(texto.x - bc!.x)).toBeLessThan(1);
      expect(bf!.x).toBeGreaterThan(bc!.x);
      const rotulo = page.locator("#formacao .entry-child-label");
      const icone = page.locator("#formacao .entry-child-icon");
      const [br, bi] = await Promise.all([rotulo.boundingBox(), icone.boundingBox()]);
      expect(bi!.x + bi!.width).toBeLessThanOrEqual(br!.x);
      expect(await rotulo.evaluate((el) => getComputedStyle(el).color)).toBe(await page.locator("#formacao .entry-period").evaluate((el) => getComputedStyle(el).color)); // --soft
      expect(await rotulo.evaluate((el) => getComputedStyle(el).color)).not.toBe(await filho.evaluate((el) => getComputedStyle(el).color)); // título em --ink
      expect(bf!.y).toBeGreaterThan(bd!.y + bd!.height - 1);
      const tamanho = (l: ReturnType<typeof page.locator>) => l.evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
      expect(await tamanho(filho)).toBeLessThan(await tamanho(curso));
      // O período do subitem alinha à direita com o da linha (desktop).
      const [pc, pf] = await Promise.all([page.locator("#formacao .entry-period").boundingBox(), page.locator("#formacao .entry-child-period").boundingBox()]);
      expect(Math.abs(pc!.x + pc!.width - (pf!.x + pf!.width))).toBeLessThan(2);
    });

    test("no celular o período do curso fica embaixo do texto do curso, antes da monitoria", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto(path);
      const [curso, periodo, filho] = await Promise.all([
        page.locator("#formacao .entry-main").boundingBox(),
        page.locator("#formacao .entry-period").boundingBox(),
        page.locator("#formacao .entry-child").boundingBox(),
      ]);
      expect(periodo!.y).toBeGreaterThanOrEqual(curso!.y + curso!.height - 1);
      expect(filho!.y).toBeGreaterThanOrEqual(periodo!.y + periodo!.height - 1);
    });

    test("logos reais da TechEduConnect, do Hospital e do IFPB carregam, sem fundo", async ({ page }) => {
      await page.goto(path);
      const exp = page.locator("section", { has: page.getByRole("heading", { name: t.exp.heading }) });
      const form = page.locator("section", { has: page.getByRole("heading", { name: t.form.heading }) });
      await expect(exp.locator("img.entry-logo")).toHaveCount(2);
      await expect(form.locator("img.entry-logo")).toHaveCount(1);
      for (const l of [exp.locator("img.entry-logo"), form.locator("img.entry-logo")]) {
        for (const img of await l.all()) {
          await expect(img).toBeVisible();
          expect(await img.evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth > 0)).toBe(true);
        }
      }
    });

    test("toda linha de experiência e formação tem um logo, sem selo, e legível nos dois temas", async ({ page }) => {
      await page.goto(path);
      const linhas = page.locator("#experiencia .entry, #formacao .entry");
      expect(await linhas.count()).toBe(3);
      for (let i = 0; i < 3; i++) {
        const l = linhas.nth(i);
        await expect(l.locator("img.entry-logo")).toHaveCount(1); // o Hospital tem o logo oficial, sem ícone de reserva
        await expect(l.locator("svg.fallback-icon")).toHaveCount(0);
      }
      // Sem selo: nenhum fundo atrás dos logos; no escuro os pretos são invertidos pra continuar legíveis.
      for (const img of await page.locator("img.entry-logo").all()) {
        await expect(img).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
        await expect(img).toHaveCSS("filter", "none");
      }
      await page.getByRole("button", { name: t.tema }).click();
      for (const img of await page.locator("img.entry-logo:not([data-colored])").all()) await expect(img).not.toHaveCSS("filter", "none");
      // O verde do Hospital já é legível sobre o fundo escuro: continua como é.
      await expect(page.locator("img.entry-logo[data-colored]")).toHaveCSS("filter", "none");
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
