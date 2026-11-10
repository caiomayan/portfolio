import { expect, test, type Page } from "@playwright/test";

// Preview do site do Carmine no hover do link "stcarmine.com" (#21). Nunca vai pra rede de verdade:
// o link aponta pra fora, então qualquer clique/toque é interceptado.
async function semRedeExterna(page: Page) {
  await page.route("https://stcarmine.com/**", (r) => r.fulfill({ status: 200, contentType: "text/html", body: "<title>x</title>" }));
}

const link = (page: Page) => page.locator("#carmine").getByRole("link", { name: /stcarmine\.com/ });
const preview = (page: Page) => page.locator(".link-preview");

/** Rola até o link e espera a entrada ao rolar (`Reveal`) terminar: até lá o link ainda se desloca. */
async function pontoDoLink(page: Page) {
  await link(page).scrollIntoViewIfNeeded();
  const parte = page.locator("#carmine .links");
  await expect.poll(() => parte.evaluate((el) => getComputedStyle(el).opacity + "|" + getComputedStyle(el).transform)).toMatch(/^1\|(none|matrix\(1, 0, 0, 1, 0, 0\))$/);
  const box = (await link(page).boundingBox())!;
  return { box, cx: box.x + box.width / 2, cy: box.y + box.height / 2 };
}

/** Matriz do transform computado: [a, b, c, d, tx, ty]. */
const matriz = (page: Page) =>
  preview(page).evaluate((el) => {
    const t = getComputedStyle(el).transform;
    return t === "none" ? [1, 0, 0, 1, 0, 0] : t.match(/-?[\d.]+(?:e-?\d+)?/g)!.map(Number);
  });

for (const path of ["/", "/en"]) {
  test.describe(`preview do Carmine em ${path}`, () => {
    test("não existe no DOM antes do hover", async ({ page }) => {
      await page.goto(path);
      await expect(preview(page)).toHaveCount(0);
    });

    test("aparece no hover com a imagem do site, decorativo, e some ao sair, sem erro de console nem rede", async ({ page }) => {
      const problemas: string[] = [];
      page.on("console", (m) => m.type() === "error" && problemas.push(`console: ${m.text()}`));
      page.on("pageerror", (e) => problemas.push(`pageerror: ${e.message}`));
      page.on("response", (r) => r.status() >= 400 && problemas.push(`${r.status()} ${r.url()}`));
      await semRedeExterna(page);
      await page.goto(path);
      const { cx, cy } = await pontoDoLink(page);
      await page.mouse.move(cx, cy);

      await expect(preview(page)).toHaveCount(1);
      await expect(preview(page)).toHaveAttribute("aria-hidden", "true");
      const img = preview(page).locator("img");
      await expect(img).toHaveAttribute("alt", "");
      await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth === 384 && el.naturalHeight === 224)).toBe(true);
      await expect.poll(async () => Number(await preview(page).evaluate((el) => getComputedStyle(el).opacity))).toBe(1);
      const caixa = await preview(page).evaluate((el) => ({ w: (el as HTMLElement).offsetWidth, h: (el as HTMLElement).offsetHeight }));
      expect(caixa).toEqual({ w: 192, h: 112 });
      // Cartão: --surface, cantos e sombra só nele (o link não muda).
      await expect(preview(page)).toHaveCSS("position", "fixed");
      await expect(preview(page)).toHaveCSS("pointer-events", "none");
      expect(await preview(page).evaluate((el) => getComputedStyle(el).boxShadow)).not.toBe("none");

      await page.mouse.move(2, 2);
      await expect(preview(page)).toHaveCount(0);
      expect(problemas).toEqual([]);
    });

    test("o link não muda: mesmo nome, destino e estilo; o preview fica fora da árvore de acessibilidade", async ({ page }) => {
      await semRedeExterna(page);
      await page.goto(path);
      await expect(link(page)).toHaveCount(1);
      await expect(link(page)).toHaveAttribute("href", "https://stcarmine.com");
      await expect(link(page)).toHaveClass(/link-external/);
      await expect(link(page)).toHaveAccessibleName(/^stcarmine\.com/);
      const antes = await link(page).evaluate((el) => getComputedStyle(el).textDecorationLine + getComputedStyle(el).color);
      const { cx, cy } = await pontoDoLink(page);
      await page.mouse.move(cx, cy);
      await expect(preview(page)).toHaveCount(1);
      await expect(link(page)).toHaveAccessibleName(/^stcarmine\.com/);
      expect(await link(page).evaluate((el) => getComputedStyle(el).textDecorationLine + getComputedStyle(el).color)).toBe(antes);
      // Só um link "stcarmine.com" visível pro leitor de tela; o cartão não traz texto nem link.
      expect(await preview(page).evaluate((el) => el.textContent)).toBe("");
      expect(await preview(page).locator("a, button, [tabindex]").count()).toBe(0);
    });

    test("teclado: foco no link não abre o preview e o Tab segue igual", async ({ page }) => {
      await page.goto(path);
      await link(page).focus();
      await expect(link(page)).toBeFocused();
      await expect(preview(page)).toHaveCount(0);
      await page.keyboard.press("Tab");
      await expect(link(page)).not.toBeFocused();
    });

    test("segue o ponteiro com mola e inclina conforme o lado; só transform e opacity animam", async ({ page }) => {
      await semRedeExterna(page);
      await page.goto(path);
      const { box, cx, cy } = await pontoDoLink(page);
      await page.mouse.move(cx, cy);
      await expect(preview(page)).toHaveCount(1);
      await expect.poll(async () => Number(await preview(page).evaluate((el) => getComputedStyle(el).opacity))).toBe(1);

      // Centro do link: sem inclinação. Direita: inclina num sentido; esquerda: no outro (máximo 15°).
      await page.mouse.move(box.x + box.width - 2, cy, { steps: 6 });
      await expect.poll(async () => (await matriz(page))[1]).not.toBeCloseTo(0, 2);
      const direita = (await matriz(page))[1];
      await page.mouse.move(box.x + 2, cy, { steps: 6 });
      await expect.poll(async () => Math.sign((await matriz(page))[1])).toBe(-Math.sign(direita));
      // A mola passa um pouco do alvo (300/20) e assenta nos 15° do limite.
      const graus = async () => {
        const [a, b] = await matriz(page);
        return Math.abs(Math.atan2(b, a) * (180 / Math.PI));
      };
      expect(await graus()).toBeLessThanOrEqual(20);
      await expect.poll(graus).toBeCloseTo(15, 0);

      // Segue o ponteiro (acima dele, com o deslocamento de 40 px) e sempre dentro da tela.
      await page.mouse.move(box.x + box.width * 0.75, cy, { steps: 6 });
      await expect
        .poll(async () => {
          const r = await preview(page).evaluate((el) => el.getBoundingClientRect().toJSON());
          return Math.abs(r.left + r.width / 2 - (box.x + box.width * 0.75));
        })
        .toBeLessThan(6);
      const r = await preview(page).evaluate((el) => el.getBoundingClientRect().toJSON());
      expect(r.bottom).toBeLessThanOrEqual(cy - 8); // acima do ponteiro (a caixa inclinada desce uns 24 px nos cantos)

      // Nada de layout/paint por quadro: o cartão não usa left/top/width/height animados.
      const estilo = (await preview(page).getAttribute("style")) ?? "";
      expect(estilo).not.toMatch(/(^|;|\s)(left|top|width|height|margin)\s*:/);
    });

    test("no toque o preview não existe", async ({ browser }) => {
      const ctx = await browser.newContext({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } });
      const page = await ctx.newPage();
      await semRedeExterna(page);
      await page.goto(path);
      expect(await page.evaluate(() => matchMedia("(hover: hover) and (pointer: fine)").matches)).toBe(false);
      await link(page).scrollIntoViewIfNeeded();
      // O toque não pode navegar: senão a contagem seria de outra página e o teste não provaria nada.
      await page.evaluate(() => document.querySelector("#carmine .link-external")!.addEventListener("click", (e) => e.preventDefault(), true));
      const pointerEnter = page.evaluate(
        () => new Promise<string>((ok) => document.querySelector("#carmine .link-external")!.addEventListener("pointerenter", (e) => ok((e as PointerEvent).pointerType), { once: true })),
      );
      await link(page).tap();
      expect(await pointerEnter).toBe("touch"); // o toque chegou ao link
      await page.waitForTimeout(300);
      expect(new URL(page.url()).pathname).toBe(path);
      await expect(link(page)).toHaveCount(1);
      await expect(preview(page)).toHaveCount(0);
      await ctx.close();
    });

    test("com reduced-motion aparece e some, sem inclinação, mola nem movimento", async ({ browser }) => {
      const ctx = await browser.newContext({ reducedMotion: "reduce" });
      const page = await ctx.newPage();
      await semRedeExterna(page);
      await page.goto(path);
      const { box, cx, cy } = await pontoDoLink(page);
      await page.mouse.move(cx, cy);
      await expect(preview(page)).toHaveCount(1);
      await expect(preview(page)).toHaveCSS("opacity", "1"); // sem fade
      const [a0, b0] = await matriz(page);
      expect([a0, b0]).toEqual([1, 0]); // sem inclinação nem escala
      const r0 = await preview(page).evaluate((el) => el.getBoundingClientRect().toJSON());
      await page.mouse.move(box.x + box.width - 2, cy, { steps: 6 });
      await page.waitForTimeout(400);
      const r1 = await preview(page).evaluate((el) => el.getBoundingClientRect().toJSON());
      expect(r1.left).toBe(r0.left); // parado: não segue o ponteiro
      expect(r1.top).toBe(r0.top);
      expect((await matriz(page)).slice(0, 2)).toEqual([1, 0]);
      await page.mouse.move(2, 2);
      await expect(preview(page)).toHaveCount(0); // some na hora
      await ctx.close();
    });
  });
}
