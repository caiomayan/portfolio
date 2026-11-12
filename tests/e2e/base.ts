import { expect, test as base, type Page } from "@playwright/test";

export * from "@playwright/test";

/**
 * Os testes partem de "a abertura (#39) já rodou nesta aba": o script inline só a dispara quando o sessionStorage não tem a marca,
 * e uma tela de cobertura por 1,6 s atrapalharia quase todos os testes. Só `abertura.spec.ts` importa direto de `@playwright/test`
 * pra ver a abertura de verdade. A marca é posta em todo contexto novo, inclusive os criados com `browser.newContext()`.
 */
const markOpeningDone = () => {
  try {
    sessionStorage.setItem("opening", "1");
  } catch {
    /* sem armazenamento: a abertura roda, e o teste que depende disso diz */
  }
};

export const test = base.extend<{ openingDone: void }>({
  openingDone: [
    async ({ browser }, use) => {
      const original = browser.newContext.bind(browser);
      browser.newContext = async (options) => {
        const context = await original(options);
        await context.addInitScript(markOpeningDone);
        return context;
      };
      await use();
      browser.newContext = original;
    },
    { auto: true },
  ],
});

/**
 * Leva o elemento à vista e espera a coreografia das seções (#39) assentar nele e nos pais: enquanto ela conduz a entrada, o elemento ainda tem
 * opacity e transform inline (que saem no fim, `clearProps`) e medidas, hover e contraste dariam outro valor.
 */
export async function assentar(page: Page, seletor: string) {
  const alvo = page.locator(seletor).first();
  await alvo.scrollIntoViewIfNeeded();
  await expect
    .poll(() => alvo.evaluate((el) => { for (let n: Element | null = el; n && n !== document.body; n = n.parentElement) if (/opacity|transform/.test(n.getAttribute("style") ?? "")) return false; return true; }), { timeout: 10_000 })
    .toBe(true);
}

/** Rola a página toda, espera nada ficar pendente e volta à rolagem de antes: para testes de contraste (axe) e de medidas da página inteira. */
export async function assentarTudo(page: Page) {
  const y0 = await page.evaluate(() => window.scrollY);
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y <= total; y += 500) {
    await page.evaluate((v) => window.scrollTo(0, v), y);
    await page.waitForTimeout(120);
  }
  await expect.poll(() => page.locator("[data-motion=pending]").count(), { timeout: 10_000 }).toBe(0);
  await page.evaluate((v) => window.scrollTo(0, v), y0);
  await page.waitForTimeout(150);
}
