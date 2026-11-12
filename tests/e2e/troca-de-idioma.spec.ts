import { expect, test, type Page } from "./base";

// Issue #38: trocar de idioma não recarrega a página. O conteúdo troca na hora, o endereço muda, a rolagem fica onde estava.
declare global {
  interface Window {
    __marca?: number;
  }
}

/** Abre o menu no topo, rola a página e só então escolhe (clique do script, que não rola até o item): a rolagem da troca é a do visitante, não a do teste. */
async function escolher(page: Page, nome: string, rolagem: number) {
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.getByRole("button", { name: /^(Idioma|Language)/ }).click();
  await expect(page.getByRole("menuitemradio", { checked: true })).toBeFocused(); // o foco entra no item da língua atual
  await page.evaluate((y) => window.scrollTo(0, y), rolagem);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(rolagem - 5);
  await page.getByRole("menuitemradio", { name: nome }).evaluate((el) => (el as HTMLElement).click());
}

test("a troca de idioma não recarrega a página", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => {
    window.__marca = 42;
  });
  const rolagem = 900;
  const entradas = await page.evaluate(() => performance.getEntriesByType("navigation").length);

  for (const [nome, caminho, lang, h1] of [
    ["English", "/en", "en", "Software Engineer"],
    ["Español", "/es", "es", "Ingeniero de Software"],
    ["Português", "/", "pt-BR", "Engenheiro de Software"],
  ] as const) {
    await escolher(page, nome, rolagem);
    await expect(page.locator("html")).toHaveAttribute("lang", lang);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(h1);
    expect(new URL(page.url()).pathname).toBe(caminho);
    // Sem recarregar: a marca em window continua viva e nenhuma navegação nova foi registrada.
    expect(await page.evaluate(() => window.__marca)).toBe(42);
    expect(await page.evaluate(() => performance.getEntriesByType("navigation").length)).toBe(entradas);
    expect(await page.evaluate(() => performance.navigation.type)).toBe(0);
    // A rolagem fica onde estava (o texto muda de tamanho entre as línguas: alguns pixels de folga).
    const y = await page.evaluate(() => window.scrollY);
    expect(Math.abs(y - rolagem)).toBeLessThan(120);
  }
});

/** Grava, quadro a quadro, as animações de View Transition (pseudo-elementos) e a duração de cada uma. */
async function gravarTransicoes(page: Page) {
  await page.evaluate(() => {
    const w = window as unknown as { __vt: Set<string> };
    w.__vt = new Set();
    const t0 = performance.now();
    const tick = () => {
      for (const a of document.getAnimations()) {
        const efeito = a.effect as KeyframeEffect | null;
        const pe = efeito?.pseudoElement;
        if (pe?.startsWith("::view-transition")) w.__vt.add(`${pe}|${efeito!.getComputedTiming().duration}`);
      }
      if (performance.now() - t0 < 1200) requestAnimationFrame(tick);
    };
    tick();
  });
}
const lidas = (page: Page) => page.evaluate(() => [...(window as unknown as { __vt: Set<string> }).__vt]);

test("a troca é um crossfade de até 200 ms, só opacidade, e o topo não some", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  await page.getByRole("button", { name: /^Idioma/ }).click();
  await gravarTransicoes(page);
  await page.getByRole("menuitemradio", { name: "English" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Software Engineer");
  await page.waitForTimeout(1300);
  const vistas = await lidas(page);
  expect(vistas.length, "nenhuma View Transition rodou").toBeGreaterThan(0);
  for (const v of vistas) {
    const [pe, ms] = v.split("|");
    if (pe.startsWith("::view-transition-group")) continue; // o grupo não muda de tamanho nem de lugar: só as imagens (antiga e nova) aparecem
    expect(Number(ms), v).toBeLessThanOrEqual(200);
    expect(pe).toContain("(root)");
  }
  // O crossfade padrão só mexe em opacity: as animações dos pseudo-elementos são "-ua-view-transition-fade-*".
  const nomes = await page.evaluate(() => document.getAnimations().length);
  expect(nomes).toBeGreaterThanOrEqual(0);
});

test("com prefers-reduced-motion a troca é imediata: nenhuma animação de View Transition", async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await page.goto("/");
  await page.getByRole("button", { name: /^Idioma/ }).click();
  await gravarTransicoes(page);
  await page.getByRole("menuitemradio", { name: "Español" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Ingeniero de Software", { timeout: 1000 });
  await page.waitForTimeout(1300);
  expect(await lidas(page)).toEqual([]);
  await ctx.close();
});

test("a troca de tema continua com o fade da página inteira", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/en");
  await page.getByRole("menuitemradio").count(); // menu fechado
  await gravarTransicoes(page);
  await page.getByRole("button", { name: "Dark theme" }).click();
  await page.waitForTimeout(1300);
  expect((await lidas(page)).some((v) => v.includes("(root)"))).toBe(true);
});

test("o topo não é recriado a ponto de redesenhar a assinatura: ela aparece pronta depois da troca", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  await page.waitForTimeout(3500); // a assinatura termina de se desenhar na abertura
  await page.getByRole("button", { name: /^Idioma/ }).click();
  await page.getByRole("menuitemradio", { name: "English" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Software Engineer");
  // Pronta: a versão estática (preenchida), sem o desenho letra a letra de novo.
  await expect(page.locator(".signature")).toHaveAttribute("data-static", "");
  expect(await page.locator(".signature").evaluate((el) => getComputedStyle(el).visibility)).toBe("visible");
});

test("o tema escuro sobrevive à troca de idioma, sem piscar", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("theme", "dark"));
  await page.goto("/");
  const html = page.locator("html");
  await expect(html).toHaveAttribute("data-theme", "dark");
  // Grava toda mudança do atributo durante as trocas: nenhum quadro pode ficar sem o tema escuro.
  await page.evaluate(() => {
    const w = window as unknown as { __claro: number };
    w.__claro = 0;
    const olha = () => {
      if (document.documentElement.dataset.theme !== "dark") w.__claro++;
    };
    new MutationObserver(olha).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    const tick = () => {
      olha();
      requestAnimationFrame(tick);
    };
    tick();
  });
  for (const [nome, caminho] of [["Español", "/es"], ["English", "/en"], ["Português", "/"]] as const) {
    await page.getByRole("button", { name: /^(Idioma|Language)/ }).click();
    await page.getByRole("menuitemradio", { name: nome }).click();
    await expect(page).toHaveURL(new RegExp(`${caminho === "/" ? "/$" : caminho + "$"}`));
    await expect(html).toHaveAttribute("data-theme", "dark");
    await page.waitForTimeout(400);
    await expect(html).toHaveAttribute("data-theme", "dark");
  }
  expect(await page.evaluate(() => (window as unknown as { __claro: number }).__claro), "algum quadro ficou claro").toBe(0);
  // O botão de tema segue coerente e o tema claro também sobrevive.
  await page.getByRole("button", { name: "Tema escuro" }).click();
  await expect(html).not.toHaveAttribute("data-theme", "dark");
  await page.getByRole("button", { name: /^Idioma/ }).click();
  await page.getByRole("menuitemradio", { name: "English" }).click();
  await expect(page).toHaveURL(/\/en$/);
  await expect(html).not.toHaveAttribute("data-theme", "dark");
});
