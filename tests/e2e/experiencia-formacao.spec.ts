import { expect, test } from "@playwright/test";

// Texto: docs/copy-deck.md (seções Experiência e Formação).
for (const path of ["/", "/en"]) {
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
      const sec = page.locator("section", { has: page.getByRole("heading", { name: "Experiência" }) });
      await expect(sec.getByText("Estagiário de Engenharia de Software")).toBeVisible();
      await expect(sec.getByText("out. 2026 – atual · remoto")).toBeVisible();
      await expect(sec.getByText(/Plugin de correção de redações com IA para Moodle, em produção numa instituição de ensino superior\. A IA propõe a avaliação e o tutor revisa e aprova\./)).toBeVisible();
      await expect(sec.getByText("Plataformas de ensino próprias em Next.js, React e TypeScript, e customizações e integrações para Moodle em PHP.")).toBeVisible();
      await expect(sec.getByText("Desenvolvo com agentes de código (Claude Code com skills), a partir de specs, testes e quality gates.")).toBeVisible();
      await expect(sec.getByText("Hospital Napoleão Laureano")).toBeVisible();
      await expect(sec.getByText("mai. 2024 – mai. 2025 · João Pessoa")).toBeVisible();
      await expect(sec.getByText("Jovem Aprendiz, setor de Compras")).toBeVisible();
      // ordem: TechEduConnect antes do Hospital
      const text = await sec.innerText();
      expect(text.indexOf("TechEduConnect")).toBeLessThan(text.indexOf("Hospital Napoleão Laureano"));
    });

    test("formação: IFPB, monitoria e inglês C2", async ({ page }) => {
      await page.goto(path);
      const sec = page.locator("section", { has: page.getByRole("heading", { name: "Formação" }) });
      await expect(sec.getByText("Tecnologia em Sistemas para Internet")).toBeVisible();
      await expect(sec.getByText("Instituto Federal da Paraíba (IFPB), campus João Pessoa")).toBeVisible();
      await expect(sec.getByText("out. 2024 – jul. 2027 (previsão)")).toBeVisible();
      await expect(sec.getByText("Monitor da disciplina de Segurança de Dados")).toBeVisible();
      await expect(sec.getByText("semestre 2026.2")).toBeVisible();
      await expect(sec.getByText("Inglês fluente")).toBeVisible();
      await expect(sec.getByText("C2, EF SET")).toBeVisible();
    });

    test("logos reais da TechEduConnect e do IFPB carregam; o Hospital só tem o nome", async ({ page }) => {
      await page.goto(path);
      const exp = page.locator("section", { has: page.getByRole("heading", { name: "Experiência" }) });
      const form = page.locator("section", { has: page.getByRole("heading", { name: "Formação" }) });
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
