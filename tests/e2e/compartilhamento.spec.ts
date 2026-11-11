import { expect, test } from "@playwright/test";
import { SITE_URL } from "@/lib/site";
import { rotasTexto } from "./textos";

// Issue #8: prévia de link por língua, sitemap e robots.
const rotas = [
  { path: "/", titulo: "Caio Mayan — Engenheiro de Software", locale: "pt_BR", imagem: "/og/pt", url: SITE_URL },
  { path: "/en", titulo: "Caio Mayan — Software Engineer", locale: "en_US", imagem: "/og/en", url: `${SITE_URL}/en` },
  { path: "/es", titulo: "Caio Mayan — Ingeniero de Software", locale: "es_ES", imagem: "/og/es", url: `${SITE_URL}/es` },
] as const;

for (const r of rotas) {
  test.describe(`prévia de ${r.path}`, () => {
    test("título, descrição, Open Graph e Twitter card", async ({ page }) => {
      await page.goto(r.path);
      const meta = (sel: string) => page.locator(`head meta[${sel}]`);
      const t = rotasTexto[r.path];
      const descricao = `${t.titulo}. ${t.lead}`;
      await expect(page).toHaveTitle(r.titulo);
      await expect(meta('name="description"')).toHaveAttribute("content", descricao);
      await expect(meta('property="og:title"')).toHaveAttribute("content", r.titulo);
      await expect(meta('property="og:description"')).toHaveAttribute("content", descricao);
      await expect(meta('property="og:type"')).toHaveAttribute("content", "website");
      await expect(meta('property="og:url"')).toHaveAttribute("content", r.url);
      await expect(meta('property="og:locale"')).toHaveAttribute("content", r.locale);
      await expect(meta('name="twitter:card"')).toHaveAttribute("content", "summary_large_image");
      await expect(meta('name="twitter:title"')).toHaveAttribute("content", r.titulo);
      await expect(page.locator('head link[rel="canonical"]')).toHaveAttribute("href", r.url);
    });

    test("imagem de prévia própria da rota, gerada no build e com 200", async ({ page, request }) => {
      await page.goto(r.path);
      const og = await page.locator('head meta[property="og:image"]').getAttribute("content");
      const tw = await page.locator('head meta[name="twitter:image"]').getAttribute("content");
      expect(og).toMatch(new RegExp(`^${SITE_URL}${r.imagem}`));
      expect(tw).toMatch(new RegExp(`^${SITE_URL}${r.imagem}`));
      for (const url of [og!, tw!]) {
        const res = await request.get(new URL(url).pathname);
        expect(res.status()).toBe(200);
        expect(res.headers()["content-type"]).toBe("image/png");
      }
    });
  });
}

test("sitemap.xml lista as três rotas com alternativas de língua", async ({ request }) => {
  const res = await request.get("/sitemap.xml");
  expect(res.status()).toBe(200);
  const xml = await res.text();
  expect(xml).toContain(`<loc>${SITE_URL}</loc>`);
  expect(xml).toContain(`<loc>${SITE_URL}/en</loc>`);
  expect(xml).toContain(`<loc>${SITE_URL}/es</loc>`);
  expect(xml).toContain(`hreflang="es"`);
  expect(xml).toContain(`hreflang="en"`);
  expect(xml).toContain(`hreflang="pt-BR"`);
});

test("robots.txt libera tudo e aponta o sitemap", async ({ request }) => {
  const res = await request.get("/robots.txt");
  expect(res.status()).toBe(200);
  const txt = await res.text();
  expect(txt).toMatch(/User-Agent: \*/i);
  expect(txt).toMatch(/Allow: \//i);
  expect(txt).toContain(`Sitemap: ${SITE_URL}/sitemap.xml`);
});
