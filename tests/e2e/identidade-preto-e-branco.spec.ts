import { expect, test, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

// Issue #18: nenhum vermelho de identidade. Cores de contexto (logos, imagens) ficam de fora: aqui só texto, fundo, borda,
// sublinhado, contorno e pseudo-elementos do site, em cinza puro (R = G = B) nos dois temas.
// Os cinzas do tema têm um tom azulado quase imperceptível (ex.: #6e6e73, diferença de 5): vermelho seria dezenas.
const TOLERANCIA = 6;

async function coresNaoCinza(page: Page): Promise<string[]> {
  return page.evaluate((TOLERANCIA) => {
    const props = ["color", "backgroundColor", "borderTopColor", "borderRightColor", "borderBottomColor", "borderLeftColor", "textDecorationColor", "outlineColor", "caretColor"] as const;
    const out: string[] = [];
    for (const el of document.querySelectorAll("body, body *")) {
      if (el.closest("img")) continue;
      for (const pseudo of [null, "::before", "::after", "::marker"]) {
        const cs = getComputedStyle(el, pseudo);
        for (const p of props) {
          const v = cs[p];
          const m = /^rgba?\(/.test(v) ? v.match(/[\d.]+/g) : null;
          if (!m) continue;
          const [r, g, b] = m.map(Number);
          if (Math.abs(r - g) > TOLERANCIA || Math.abs(g - b) > TOLERANCIA) out.push(`${el.tagName.toLowerCase()}${pseudo ?? ""} ${p}=${v}`);
        }
      }
    }
    return out;
  }, TOLERANCIA);
}

for (const rota of ["/", "/en", "/es"]) {
  for (const tema of ["light", "dark"]) {
    test(`${rota} (${tema}): texto, fundos, sublinhados e pontos só em cinza`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.addInitScript((tm) => (tm === "dark" ? localStorage.setItem("theme", "dark") : localStorage.removeItem("theme")), tema);
      await page.goto(rota);
      // Estados que desenham sublinhado/realce: hover nos links e no e-mail.
      for (const sel of [".contact-link", "#carmine .link-external", "#experiencia h3 a"]) {
        const el = page.locator(sel).first();
        if (await el.count()) {
          await el.scrollIntoViewIfNeeded();
          await el.hover();
          expect(await coresNaoCinza(page), `cor fora do cinza com hover em ${sel}`).toEqual([]);
        }
      }
      expect(await coresNaoCinza(page)).toEqual([]);
    });
  }
}

test("o CSS servido não tem mais acento (nem na seleção de texto) e a paleta não tem vermelho", async ({ page, request }) => {
  await page.goto("/");
  const hrefs = await page.locator('link[rel="stylesheet"]').evaluateAll((els) => els.map((e) => (e as HTMLLinkElement).href));
  expect(hrefs.length).toBeGreaterThan(0);
  for (const h of hrefs) {
    const css = await (await request.get(new URL(h).pathname)).text();
    expect(css).not.toMatch(/--accent/);
    expect(css).not.toMatch(/#d92b21|#ff5a4f/i);
  }
  const fonte = fs.readFileSync(path.join(process.cwd(), "lib/palette.ts"), "utf8");
  expect(fonte).not.toMatch(/accent|#d92b21/i);
});

// Favicon e imagens de prévia: caminhos relativos ao servidor local (og:image aponta pro domínio de produção).
test("favicon e imagens de prévia são só preto, branco e cinza", async ({ page }) => {
  await page.goto("/");
  const icon = new URL((await page.locator('head link[rel="icon"]').first().getAttribute("href"))!, "http://x").pathname;
  const og = new URL((await page.locator('head meta[property="og:image"]').getAttribute("content"))!).pathname;
  await page.goto("/en");
  const ogEn = new URL((await page.locator('head meta[property="og:image"]').getAttribute("content"))!).pathname;
  for (const caminho of [icon, og, ogEn]) {
    const colorido = await page.evaluate(async (p) => {
      const blob = await (await fetch(p)).blob();
      const bmp = await createImageBitmap(blob);
      const canvas = document.createElement("canvas");
      canvas.width = bmp.width;
      canvas.height = bmp.height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(bmp, 0, 0);
      const d = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      let max = 0;
      for (let i = 0; i < d.length; i += 4) max = Math.max(max, Math.abs(d[i] - d[i + 1]), Math.abs(d[i + 1] - d[i + 2]));
      return max;
    }, caminho);
    expect(colorido, `${caminho} tem pixels coloridos`).toBeLessThanOrEqual(TOLERANCIA);
  }
});
