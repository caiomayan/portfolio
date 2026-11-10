import { expect, test } from "@playwright/test";

// Issue #29, revisão de frontend: mapa sem corte seco (máscara), títulos de seção unificados, idiomas com largura contida e rodapé mínimo.
const rotas = [
  { path: "/", carmine: "Carmine", nota: "Projeto pessoal", contato: "Contato", credito: /^Dados do clima por Open-Meteo\.com$/ },
  { path: "/en", carmine: "Carmine", nota: "Personal project", contato: "Contact", credito: /^Weather data by Open-Meteo\.com$/ },
] as const;

// Parte opaca do recorte, em fração (iguais a --fade-x, --fade-right e --fade-y em app/globals.css): tem que conter o pino com folga pro pulso.
const fade = { esquerda: 0.14, direita: 0.34, vertical: 0.16 };

for (const r of rotas) {
  test.describe(`revisão de frontend em ${r.path}`, () => {
    test("o mapa some nas bordas por máscara (quatro bordas, mais forte à direita) e o pino fica fora do fade", async ({ page }) => {
      await page.goto(r.path);
      const mapa = page.locator(".place-art");
      const m = await mapa.evaluate((el) => {
        const cs = getComputedStyle(el);
        return { img: cs.maskImage || cs.webkitMaskImage, comp: cs.maskComposite || cs.webkitMaskComposite };
      });
      expect(m.img.match(/linear-gradient/g)).toHaveLength(4);
      // O fade de cada borda (o navegador pode reescrever "to left" como ângulo, então confere as larguras): 14 %, 34 % (direita) e 16 % (cima e baixo).
      for (const pct of ["14%", "34%", "16%"]) expect(m.img).toContain(pct);
      expect(m.comp).toMatch(/intersect|source-in/);
      const box = (await mapa.boundingBox())!;
      const pin = (await page.locator(".place-pin").boundingBox())!;
      const x = (pin.x + pin.width / 2 - box.x) / box.width;
      const y = (pin.y + pin.height / 2 - box.y) / box.height;
      const folgaX = 10 / box.width; // raio do pulso, ~8,4 px
      const folgaY = 10 / box.height;
      expect(x - folgaX).toBeGreaterThan(fade.esquerda);
      expect(x + folgaX).toBeLessThan(1 - fade.direita);
      expect(y - folgaY).toBeGreaterThan(fade.vertical);
      expect(y + folgaY).toBeLessThan(1 - fade.vertical);
    });

    test("a máscara age na transparência: o mesmo CSS nos dois temas", async ({ page }) => {
      const lidas: string[] = [];
      for (const tema of ["light", "dark"]) {
        await page.addInitScript((tm) => localStorage.setItem("theme", tm), tema);
        await page.goto(r.path);
        lidas.push(await page.locator(".place-art").evaluate((el) => getComputedStyle(el).maskImage || getComputedStyle(el).webkitMaskImage));
      }
      expect(lidas[0]).toBe(lidas[1]);
    });

    test("todas as seções têm o mesmo título grande, com id, h2 e nome acessível", async ({ page }) => {
      await page.goto(r.path);
      const estilo = (sel: string) =>
        page.locator(sel).evaluate((e) => {
          const cs = getComputedStyle(e);
          return `${cs.fontSize}/${cs.fontWeight}/${cs.letterSpacing}/${cs.color}`;
        });
      const base = await estilo("#experiencia h2");
      for (const sel of ["#formacao h2", "#fundamentos h2", "#carmine h2", "#contato"]) expect(await estilo(sel), sel).toBe(base);
      await expect(page.locator("#contato")).toHaveJSProperty("tagName", "H2");
      await expect(page.getByRole("heading", { level: 2, name: r.contato })).toHaveAttribute("id", "contato");
      await expect(page.getByRole("heading", { level: 2, name: r.carmine, exact: true })).toBeVisible();
      await expect(page.locator("section#carmine")).toHaveAttribute("aria-labelledby", "carmine-title");
    });

    test("Carmine: sem coluna lateral nem título repetido; título, nota discreta e depois status, descrição, stack e links", async ({ page }) => {
      await page.goto(r.path);
      const secao = page.locator("#carmine");
      await expect(secao.getByText("Carmine", { exact: true })).toHaveCount(1);
      await expect(secao.locator(".carmine-aside, .project-head")).toHaveCount(0);
      const [h2, nota, status, links] = await Promise.all(["h2", ".carmine-note", ".status", ".links"].map((s) => secao.locator(s).boundingBox()));
      expect(nota!.y).toBeGreaterThan(h2!.y);
      expect(status!.y).toBeGreaterThan(nota!.y);
      expect(links!.y).toBeGreaterThan(status!.y);
      expect(Math.abs(h2!.x - status!.x)).toBeLessThan(2); // uma coluna só, na mesma borda
      await expect(secao.locator(".carmine-note")).toHaveText(r.nota);
      await expect(secao.locator("h2 img")).toHaveAttribute("alt", "");
    });

    test("idiomas no desktop: bloco de largura contida (≤ 420 px)", async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(r.path);
      const grupo = page.locator(".contact-languages");
      await grupo.scrollIntoViewIfNeeded();
      const li = (await grupo.locator("li").first().boundingBox())!;
      expect(li.width).toBeLessThanOrEqual(420);
      expect(li.width).toBeGreaterThanOrEqual(300);
    });

    test("rodapé mínimo: © com o ano atual à esquerda, crédito do clima à direita, sem linha nem fundo, fora do Contato", async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(r.path);
      const rodape = page.locator("footer.site-footer");
      await expect(rodape).toHaveCount(1);
      await rodape.scrollIntoViewIfNeeded();
      await expect(rodape.locator(".site-footer-copy")).toHaveText(`© ${new Date().getFullYear()} Caio Mayan`);
      await expect(rodape.locator(".weather-credit")).toHaveText(r.credito);
      await expect(page.locator(".contact footer, .contact .weather-credit")).toHaveCount(0);
      const [copy, cred, contato] = await Promise.all([
        rodape.locator(".site-footer-copy").boundingBox(),
        rodape.locator(".weather-credit").boundingBox(),
        page.locator("section.contact").boundingBox(),
      ]);
      expect(cred!.x).toBeGreaterThan(copy!.x + copy!.width);
      expect(Math.abs(cred!.y - copy!.y)).toBeLessThan(6); // mesma linha
      expect(copy!.y).toBeGreaterThan(contato!.y + contato!.height - 1); // depois do Contato
      const caixa = await rodape.evaluate((e) => {
        const cs = getComputedStyle(e);
        return { borda: cs.borderTopWidth, fundo: cs.backgroundColor };
      });
      expect(caixa.borda).toBe("0px");
      expect(caixa.fundo).toBe("rgba(0, 0, 0, 0)");
    });

    test("rodapé no celular: os dois textos empilham e a página não rola de lado", async ({ browser }) => {
      const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
      const page = await ctx.newPage();
      await page.goto(r.path);
      const rodape = page.locator("footer.site-footer");
      await rodape.scrollIntoViewIfNeeded();
      const [copy, cred] = await Promise.all([rodape.locator(".site-footer-copy").boundingBox(), rodape.locator(".weather-credit").boundingBox()]);
      expect(cred!.y).toBeGreaterThan(copy!.y + copy!.height - 1);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      await ctx.close();
    });
  });
}
