import { test as base } from "@playwright/test";

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
