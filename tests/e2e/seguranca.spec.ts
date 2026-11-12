import { expect, test, type Page } from "@playwright/test"; // direto do Playwright: a abertura roda de verdade (#45 exige zero violação durante ela)
import { rotasTexto } from "./textos";

// Issue #45: cabeçalhos de segurança em todas as rotas e nenhuma violação de CSP no console.
const rotas = ["/", "/en", "/es", "/og/pt", "/rota-que-nao-existe"];

test.describe("cabeçalhos de segurança", () => {
  for (const rota of rotas) {
    test(`${rota}: CSP, nosniff, referrer e permissions`, async ({ request }) => {
      const res = await request.get(rota);
      const h = res.headers();
      const csp = h["content-security-policy"];
      expect(csp).toBeTruthy();
      const dir = Object.fromEntries(csp.split(";").map((d) => d.trim().split(/\s+/)).map(([nome, ...v]) => [nome, v.join(" ")]));
      expect(dir["default-src"]).toBe("'self'");
      expect(dir["frame-ancestors"]).toBe("'none'");
      expect(dir["base-uri"]).toBe("'self'");
      expect(dir["object-src"]).toBe("'none'");
      expect(dir["form-action"]).toBe("'self'");
      expect(dir["connect-src"]).toBe("'self'");
      expect(dir["script-src"]).not.toMatch(/nonce-|\*|https?:/);
      expect(h["x-content-type-options"]).toBe("nosniff");
      expect(h["referrer-policy"]).toBe("strict-origin-when-cross-origin");
      expect(h["permissions-policy"]).toContain("camera=()");
      expect(h["permissions-policy"]).toContain("microphone=()");
      expect(h["permissions-policy"]).toContain("geolocation=()");
    });
  }

  test("a página continua estática: nenhum nonce na CSP nem no HTML", async ({ request }) => {
    const res = await request.get("/");
    expect(res.headers()["content-security-policy"]).not.toContain("nonce");
    expect(res.headers()["cache-control"]).toMatch(/s-maxage=\d+/); // estática: dinâmica sairia com no-store
    expect(await res.text()).not.toMatch(/\bnonce=/);
  });
});

/** Junta as violações de CSP vindas do evento do navegador e do console. */
function vigiarCsp(page: Page) {
  const violacoes: string[] = [];
  page.on("console", (m) => {
    if (/content security policy/i.test(m.text())) violacoes.push(`console: ${m.text()}`);
  });
  page.on("pageerror", (e) => {
    if (/content security policy/i.test(e.message)) violacoes.push(`erro: ${e.message}`);
  });
  return violacoes;
}
const comEvento = (page: Page) =>
  page.addInitScript(() => {
    document.addEventListener("securitypolicyviolation", (e) => console.error(`Content Security Policy: ${e.violatedDirective} ${e.blockedURI}`));
  });

test.describe("sem violação de CSP no console", () => {
  for (const rota of ["/", "/en", "/es"] as const) {
    test(`${rota}: abertura, rolagem e troca de tema`, async ({ page }) => {
      await comEvento(page);
      const violacoes = vigiarCsp(page);
      await page.goto(rota);
      await expect(page.locator(".opening")).toHaveCount(0, { timeout: 10_000 }); // a abertura acaba sozinha
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      await page.waitForTimeout(500);
      await page.evaluate(() => window.scrollTo(0, 0));
      const tema = page.locator("button[aria-pressed]").first();
      await tema.click();
      await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
      await tema.click();
      expect(violacoes).toEqual([]);
    });
  }

  test("troca de idioma sem recarregar", async ({ page }) => {
    await comEvento(page);
    const violacoes = vigiarCsp(page);
    await page.goto("/");
    await expect(page.locator(".opening")).toHaveCount(0, { timeout: 10_000 });
    await page.getByRole("button", { name: new RegExp(`^${rotasTexto["/"].idioma}`) }).click();
    await page.getByRole("menuitemradio").nth(1).click();
    await expect(page).toHaveURL(/\/en$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    expect(violacoes).toEqual([]);
  });

  test("404 e imagem OG", async ({ page }) => {
    await comEvento(page);
    const violacoes = vigiarCsp(page);
    await page.goto("/rota-que-nao-existe");
    await page.goto("/og/pt");
    expect(violacoes).toEqual([]);
  });
});
