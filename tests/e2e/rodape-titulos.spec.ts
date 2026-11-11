import { expect, test } from "./base";

// Issue #29, revisão de frontend: mapa sem corte seco (máscara), títulos de seção unificados, idiomas com largura contida e rodapé mínimo.
const rotas = [
  { path: "/", carmine: "Carmine", nota: "Projeto pessoal", contato: "Contato", credito: /^Dados do clima por Open-Meteo\.com$/ },
  { path: "/en", carmine: "Carmine", nota: "Personal project", contato: "Contact", credito: /^Weather data by Open-Meteo\.com$/ },
  { path: "/es", carmine: "Carmine", nota: "Proyecto personal", contato: "Contacto", credito: /^Datos del clima de Open-Meteo\.com$/ },
] as const;

// Parte opaca do recorte, em fração (iguais a --fade-x, --fade-right e --fade-y em app/globals.css): tem que conter o pino com folga pro pulso.
const fade = { esquerda: 0.21, direita: 0.1, vertical: 0.16 };

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
      // O fade de cada borda (o navegador pode reescrever "to left" como ângulo, então confere as larguras): 21 % (esquerda), 10 % (direita, só há oceano) e 16 % (cima e baixo).
      for (const pct of ["21%", "10%", "16%"]) expect(m.img).toContain(pct);
      expect(m.comp).toMatch(/intersect|source-in/);
      const box = (await mapa.boundingBox())!;
      const pin = (await page.locator(".place-pin").boundingBox())!;
      const x = (pin.x + pin.width / 2 - box.x) / box.width;
      const y = (pin.y + pin.height / 2 - box.y) / box.height;
      const folgaX = (pin.width / 2 + 1) / box.width; // o ponto do pino (o anel do pulso pode entrar no fade)
      const folgaY = (pin.height / 2 + 1) / box.height;
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
      for (const sel of ["#formacao h2", "#fundamentos h2", "#carmine h2", "#idiomas h2"]) expect(await estilo(sel), sel).toBe(base);
      await expect(page.locator("#contato")).toHaveCount(0); // a seção Contato saiu (#38)
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

    test("rodapé mínimo: © com o ano atual à esquerda, crédito do clima à direita, sem linha nem fundo, depois de Idiomas", async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(r.path);
      const rodape = page.locator("footer.site-footer");
      await expect(rodape).toHaveCount(1);
      await rodape.scrollIntoViewIfNeeded();
      await expect(rodape.locator(".site-footer-copy")).toHaveText(`© ${new Date().getFullYear()} Caio Mayan`);
      await expect(rodape.locator(".weather-credit")).toHaveText(r.credito);
      await expect(page.locator("#idiomas footer, #idiomas .weather-credit")).toHaveCount(0);
      const [copy, cred, contato] = await Promise.all([
        rodape.locator(".site-footer-copy").boundingBox(),
        rodape.locator(".weather-credit").boundingBox(),
        page.locator("#idiomas").boundingBox(),
      ]);
      expect(cred!.x).toBeGreaterThan(copy!.x + copy!.width);
      expect(Math.abs(cred!.y - copy!.y)).toBeLessThan(6); // mesma linha
      expect(copy!.y).toBeGreaterThan(contato!.y + contato!.height - 1); // depois de Idiomas
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
