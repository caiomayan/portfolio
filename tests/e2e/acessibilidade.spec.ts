import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

// Issue #8: axe sem violações (WCAG A/AA) nas duas rotas, nos dois temas.
// Movimento reduzido: o conteúdo que entra com animação já aparece pronto e também é auditado.
test.use({ reducedMotion: "reduce" });

for (const path of ["/", "/en", "/es"]) {
  for (const tema of ["light", "dark"] as const) {
    test(`${path} (${tema}): sem violações de acessibilidade`, async ({ page }) => {
      await page.addInitScript((t) => localStorage.setItem("theme", t), tema);
      await page.goto(path);
      await expect(page.locator("html")).toHaveAttribute("lang", /.+/);
      if (tema === "dark") await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
      const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
      expect(violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
    });
  }
}
