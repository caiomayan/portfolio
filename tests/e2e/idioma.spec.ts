import { expect, test, type Page } from "./base";
import { SITE_URL } from "@/lib/site";
import { rotasTexto } from "./textos";

// Issues #7 e #38: três línguas (/, /en, /es), seletor com globo e menu, hreflang. O idioma automático de `/` (#46) está em idioma-automatico.spec.ts.
const rotas = [
  { path: "/", sigla: "PT", lang: "pt-BR", atual: "Português" },
  { path: "/en", sigla: "EN", lang: "en", atual: "English" },
  { path: "/es", sigla: "ES", lang: "es", atual: "Español" },
] as const;

const botao = (page: Page, path: keyof typeof rotasTexto) => page.getByRole("button", { name: new RegExp(`^${rotasTexto[path].idioma}`) });

test.describe("rotas e hreflang", () => {
  for (const { path } of rotas) {
    test(`${path} declara hreflang pras três rotas, e o canonical é a própria`, async ({ page }) => {
      await page.goto(path);
      const alt = (l: string) => page.locator(`link[rel="alternate"][hreflang="${l}"]`);
      await expect(alt("pt-BR")).toHaveAttribute("href", SITE_URL);
      await expect(alt("en")).toHaveAttribute("href", `${SITE_URL}/en`);
      await expect(alt("es")).toHaveAttribute("href", `${SITE_URL}/es`);
      await expect(alt("x-default")).toHaveAttribute("href", SITE_URL);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", path === "/" ? SITE_URL : `${SITE_URL}${path}`);
    });
  }

  test("/en e /es abertos direto nunca são redirecionados, qualquer que seja a língua do navegador (#46)", async ({ browser }) => {
    for (const [locale, path] of [["pt-BR", "/en"], ["en-US", "/es"], ["es-ES", "/en"], ["fr-FR", "/es"], ["pt-BR", "/"]] as const) {
      const ctx = await browser.newContext({ locale, extraHTTPHeaders: { "Accept-Language": locale } });
      const page = await ctx.newPage();
      const res = await page.goto(path);
      expect(res?.status()).toBe(200);
      expect(res?.request().redirectedFrom()).toBeNull();
      expect(new URL(page.url()).pathname).toBe(path);
      await ctx.close();
    }
  });

  test("/pt e outras rotas de língua não existem (404)", async ({ page }) => {
    for (const p of ["/pt", "/fr", "/en/x", "/es/x"]) {
      const res = await page.goto(p);
      expect(res?.status(), p).toBe(404);
    }
  });

  test("a rota em inglês não tem texto em português nem em espanhol", async ({ page }) => {
    await page.goto("/en");
    const text = await page.locator("body").innerText();
    for (const palavra of ["Engenheiro", "Experiência", "Formação", "Contato", "Currículo", "Projeto pessoal", "Em desenvolvimento", "Ingeniero", "Experiencia", "Formación", "Contacto", "Currículum"]) {
      expect(text).not.toContain(palavra);
    }
  });

  test("a rota em espanhol não tem texto em português nem em inglês", async ({ page }) => {
    await page.goto("/es");
    const text = await page.locator("body").innerText();
    for (const palavra of ["Engenheiro", "Experiência", "Formação", "Contato", "Currículo", "Projeto pessoal", "Em desenvolvimento", "Software Engineer", "Experience", "Education", "Contact", "Built with", "Personal project", "Weather data"]) {
      expect(text).not.toContain(palavra);
    }
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(rotasTexto["/es"].titulo);
  });
});

test.describe("seletor de idioma: globo e menu", () => {
  for (const r of rotas) {
    test(`${r.path}: botão com globo, sigla ${r.sigla} e aria-expanded; as bandeiras saíram`, async ({ page }) => {
      await page.goto(r.path);
      const b = botao(page, r.path);
      await expect(b).toContainText(r.sigla);
      await expect(b).toHaveAttribute("aria-expanded", "false");
      await expect(b).toHaveAttribute("aria-haspopup", "menu");
      await expect(b.locator("svg")).toHaveCount(1);
      await expect(page.locator("svg[data-flag], .lang-flag, .lang-switch")).toHaveCount(0);
      const box = (await b.boundingBox())!;
      expect(box.height).toBeGreaterThanOrEqual(44);
      expect(box.width).toBeGreaterThanOrEqual(44);
      await expect(page.getByRole("menu")).toHaveCount(0);
    });

    test(`${r.path}: o menu lista as três línguas, cada uma no próprio nome, com ✓ na atual, hreflang e lang`, async ({ page }) => {
      await page.goto(r.path);
      const b = botao(page, r.path);
      await b.click();
      await expect(b).toHaveAttribute("aria-expanded", "true");
      const itens = page.getByRole("menuitemradio");
      await expect(itens).toHaveText(["Português", "English", "Español"]);
      await expect(itens.filter({ has: page.locator("svg") })).toHaveCount(1); // o ✓
      await expect(page.getByRole("menuitemradio", { checked: true })).toHaveText(r.atual);
      expect(await itens.evaluateAll((els) => els.map((e) => e.getAttribute("href")))).toEqual(["/", "/en", "/es"]);
      expect(await itens.evaluateAll((els) => els.map((e) => e.getAttribute("hreflang")))).toEqual(["pt-BR", "en", "es"]);
      expect(await itens.evaluateAll((els) => els.map((e) => e.getAttribute("lang")))).toEqual(["pt-BR", "en", "es"]);
      for (const item of await itens.all()) expect((await item.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    });
  }

  test("teclado: setas e Home/End navegam, Esc fecha e o foco volta pro botão", async ({ page }) => {
    await page.goto("/");
    const b = botao(page, "/");
    await b.focus();
    await page.keyboard.press("Enter");
    const itens = page.getByRole("menuitemradio");
    await expect(itens.nth(0)).toBeFocused(); // abre no idioma atual
    await page.keyboard.press("ArrowDown");
    await expect(itens.nth(1)).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await expect(itens.nth(2)).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await expect(itens.nth(0)).toBeFocused(); // dá a volta
    await page.keyboard.press("ArrowUp");
    await expect(itens.nth(2)).toBeFocused();
    await page.keyboard.press("Home");
    await expect(itens.nth(0)).toBeFocused();
    await page.keyboard.press("End");
    await expect(itens.nth(2)).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("menu")).toHaveCount(0);
    await expect(b).toBeFocused();
    await expect(b).toHaveAttribute("aria-expanded", "false");
  });

  test("seta pra baixo no botão abre o menu; clique fora fecha", async ({ page }) => {
    await page.goto("/en");
    const b = botao(page, "/en");
    await b.focus();
    await page.keyboard.press("ArrowDown");
    await expect(page.getByRole("menu")).toBeVisible();
    await page.mouse.click(300, 400);
    await expect(page.getByRole("menu")).toHaveCount(0);
    await expect(b).toHaveAttribute("aria-expanded", "false");
    // O botão abre e fecha com o próprio clique.
    await b.click();
    await expect(page.getByRole("menu")).toBeVisible();
    await b.click();
    await expect(page.getByRole("menu")).toHaveCount(0);
  });

  test("escolher pelo teclado troca o idioma (URL, lang, título, metas) e o foco volta pro botão", async ({ page }) => {
    await page.goto("/");
    await botao(page, "/").focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("menuitemradio").first()).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await expect(page.getByRole("menuitemradio").nth(2)).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/es$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "es");
    await expect(page).toHaveTitle("Caio Mayan");
    await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute("content", "es_ES");
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `${SITE_URL}/es`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(rotasTexto["/es"].titulo);
    await expect(botao(page, "/es")).toBeFocused();
    await expect(botao(page, "/es")).toContainText("ES");
  });

  test("o botão e o menu têm foco visível e fundo só no hover e no foco", async ({ page }) => {
    await page.goto("/");
    const b = botao(page, "/");
    await expect(b).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
    await b.hover();
    await expect(b).not.toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
    await page.mouse.move(2, 2);
    await page.keyboard.press("Tab");
    await expect(b).toBeFocused();
    expect(await b.evaluate((el) => getComputedStyle(el).outlineStyle)).not.toBe("none");
  });

  test("sem JavaScript o menu não abre, mas as rotas seguem acessíveis por endereço", async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false });
    const page = await ctx.newPage();
    for (const [p, h1] of [["/", "Engenheiro de Software"], ["/en", "Software Engineer"], ["/es", "Ingeniero de Software"]] as const) {
      await page.goto(p);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(h1);
    }
    await ctx.close();
  });
});
