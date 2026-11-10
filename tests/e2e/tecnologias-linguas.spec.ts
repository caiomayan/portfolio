import { expect, test } from "@playwright/test";
import { rotasTexto, type RotaTexto } from "./textos";

// Texto: docs/copy-deck.md (seções Tecnologias e Contato). Issue #27.
for (const path of ["/", "/en"] as RotaTexto[]) {
  const t = rotasTexto[path];
  test.describe(`tecnologias e línguas em ${path}`, () => {
    test("seção Tecnologias entre Formação e Contato, só ícones, na ordem do currículo", async ({ page }) => {
      await page.goto(path);
      const sec = page.locator("#tecnologias");
      await expect(sec.getByRole("heading", { name: t.tecnologias.heading })).toBeVisible();
      const itens = sec.locator(".stack li");
      await expect(itens).toHaveCount(t.tecnologias.nomes.length);
      for (const [i, nome] of t.tecnologias.nomes.entries()) {
        const item = itens.nth(i);
        await expect(item).toHaveText(""); // nada escrito
        await expect(item.getByRole("img", { name: nome, exact: true })).toBeVisible();
        expect(await item.locator("img, svg.fallback-icon").count()).toBe(1); // logo OU ícone de reserva
      }
      const tops = await Promise.all([page.locator("#formacao"), sec, page.locator(".contact")].map(async (l) => (await l.boundingBox())!.y));
      expect(tops).toEqual([...tops].sort((a, b) => a - b));
    });

    test("os logos carregam e o tooltip mostra o nome no hover e no foco, com Esc", async ({ page }) => {
      await page.goto(path);
      for (const img of await page.locator("#tecnologias .stack img").all()) {
        await expect(img).toBeVisible();
        expect(await img.evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth > 0)).toBe(true);
      }
      const tip = page.locator("#tecnologias .tip");
      await expect(tip).toHaveCount(0);
      await page.locator("#tecnologias .stack li").nth(1).hover();
      await expect(tip).toHaveText("Spring Boot");
      await expect(tip).toHaveAttribute("aria-hidden", "true");
      await page.mouse.move(2, 2);
      await expect(tip).toHaveCount(0);
      await page.locator("#tecnologias .stack-icon").nth(16).focus();
      await expect(tip).toHaveText("Oracle Cloud");
      await page.keyboard.press("Escape");
      await expect(tip).toHaveCount(0);
    });

    test("logos pretos invertem no tema escuro; o do Valkey, colorido, não", async ({ page }) => {
      await page.goto(path);
      await page.getByRole("button", { name: t.tema }).click();
      const filtros = await page.locator("#tecnologias .stack img").evaluateAll((els) => els.map((el) => getComputedStyle(el).filter));
      t.tecnologias.nomes.forEach((n, i) => (n === "Valkey" ? expect(filtros[i]).toBe("none") : expect(filtros[i]).toContain("invert")));
    });

    test("idiomas no Contato: rótulo e duas linhas de duas pontas, com bandeira, junto da cidade e da hora local", async ({ page }) => {
      await page.goto(path);
      const grupo = page.locator(".contact .contact-languages");
      await expect(grupo.getByRole("heading", { name: t.linguas.heading })).toBeVisible();
      const linhas = grupo.locator("li");
      await expect(linhas).toHaveCount(t.linguas.itens.length);
      for (const [i, [nome, nivel]] of t.linguas.itens.entries()) {
        const li = linhas.nth(i);
        await expect(li.locator(".contact-language-name")).toHaveText(nome);
        await expect(li.locator(".contact-language-level")).toHaveText(nivel);
        await expect(li.locator("svg.lang-flag")).toHaveCount(1);
        await expect(li.locator("svg.lang-flag")).toHaveAttribute("data-flag", i === 0 ? "BR" : "US");
      }
      await grupo.scrollIntoViewIfNeeded();
      // As partes entram em sequência (reveal): espera o layout assentar antes de medir.
      await expect
        .poll(async () => {
          const cidade = (await page.locator(".contact-map-caption").boundingBox())!;
          const g = (await grupo.boundingBox())!;
          const nome = (await linhas.first().locator(".contact-language-name").boundingBox())!;
          const nivel = (await linhas.first().locator(".contact-language-level").boundingBox())!;
          const li = (await linhas.first().boundingBox())!;
          // abaixo da cidade; nome à esquerda, nível colado na borda direita da linha
          return g.y > cidade.y && nome.x < nivel.x && Math.abs(nivel.x + nivel.width - (li.x + li.width)) < 2;
        })
        .toBe(true);
    });

    test("idiomas: nome em --ink, nível e rótulo em --soft", async ({ page }) => {
      await page.goto(path);
      const cor = (sel: string) => page.locator(sel).first().evaluate((el) => getComputedStyle(el).color);
      const [nome, nivel, rotulo] = await Promise.all([cor(".contact-language-name"), cor(".contact-language-level"), cor(".contact-languages h3")]);
      expect(nivel).toBe(rotulo);
      expect(nome).not.toBe(nivel);
    });

    test("não rola na horizontal a 375 px", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto(path);
      const { sw, cw } = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
      expect(sw).toBeLessThanOrEqual(cw);
    });
  });
}
