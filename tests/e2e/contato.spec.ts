import { expect, test, type Locator, type Page } from "@playwright/test";
import { rotasTexto } from "./textos";

const rotas = [
  { path: "/", pdf: "/caio-mayan-curriculo.pdf" },
  { path: "/en", pdf: "/caio-mayan-resume.pdf" },
] as const;

for (const { path, pdf } of rotas) {
  const t = rotasTexto[path];
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
      const botao = page.getByRole("button", { name: t.copiar });
      await expect(botao).toBeVisible();
      await botao.click();
      expect(await page.evaluate(() => navigator.clipboard.readText())).toBe("mail@caiomayan.com");
      // Confirmação visual e anunciada por leitor de tela.
      await expect(page.getByRole("status")).toHaveText(t.copiado);
      await expect(botao).toHaveAttribute("data-copied", "true");
      await ctx.close();
    });

    test("o botão de copiar tem foco visível pelo teclado", async ({ page }) => {
      await page.goto(path);
      const botao = page.getByRole("button", { name: t.copiar });
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

    // As molas do Motion em SVG não são WAAPI (document.getAnimations não as vê): mede-se o desenho dos ícones.
    // Grava, quadro a quadro, quantos desenhos diferentes o ícone assume enquanto o hover acontece.
    const desenhosVistos = async (page: Page, alvo: Locator) => {
      await alvo.evaluate((el) => {
        const w = window as unknown as { __vistos: Set<string>; __rodando: boolean };
        w.__vistos = new Set();
        w.__rodando = true;
        const snap = () =>
          [...el.querySelectorAll("svg *")]
            .map((n) => {
              const c = getComputedStyle(n);
              return `${c.transform}|${c.opacity}|${c.strokeDashoffset}|${c.strokeDasharray}|${n.getAttribute("d")}`;
            })
            .join(";");
        const tick = () => {
          w.__vistos.add(snap());
          if (w.__rodando) requestAnimationFrame(tick);
        };
        tick();
      });
      await alvo.hover();
      await page.waitForTimeout(900); // mais que a mola/traço inteiro
      return alvo.evaluate(() => {
        const w = window as unknown as { __vistos: Set<string>; __rodando: boolean };
        w.__rodando = false;
        return w.__vistos.size;
      });
    };
    const alvos = (page: Page) => [
      page.getByRole("link", { name: /LinkedIn/ }),
      page.getByRole("button", { name: t.copiar }),
    ];

    test("sem preferência de movimento, o hover muda o desenho dos ícones", async ({ page }) => {
      await page.goto(path);
      for (const alvo of alvos(page)) expect(await desenhosVistos(page, alvo)).toBeGreaterThan(1);
    });

    test("com prefers-reduced-motion, os ícones não mudam no hover nem no clique", async ({ browser }) => {
      const ctx = await browser.newContext({ reducedMotion: "reduce", permissions: ["clipboard-read", "clipboard-write"] });
      const page = await ctx.newPage();
      await page.goto(path);
      for (const alvo of alvos(page)) expect(await desenhosVistos(page, alvo)).toBe(1);
      await page.getByRole("button", { name: t.copiar }).click();
      await expect(page.getByRole("status")).toHaveText(t.copiado);
      const anim = await page.getByRole("button", { name: t.copiar }).evaluate((el) => getComputedStyle(el).animationName);
      expect(anim).toBe("none");
      await ctx.close();
    });

    test("o clique em copiar anima o botão (sem reduced-motion)", async ({ browser }) => {
      const ctx = await browser.newContext({ permissions: ["clipboard-read", "clipboard-write"] });
      const page = await ctx.newPage();
      await page.goto(path);
      const botao = page.getByRole("button", { name: t.copiar });
      await botao.click();
      await expect(botao).toHaveAttribute("data-copied", "true");
      expect(await botao.evaluate((el) => getComputedStyle(el).animationName)).toBe("pop");
      await ctx.close();
    });
  });
}
