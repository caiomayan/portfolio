import { expect, test, type Locator, type Page } from "@playwright/test";
import { rotasTexto } from "./textos";

// #38: a seção Contato saiu. Os ícones (e-mail, LinkedIn, GitHub, Currículo) ficam na faixa da primeira tela, à direita.
const rotas = [
  { path: "/", pdf: "/caio-mayan-curriculo.pdf" },
  { path: "/en", pdf: "/caio-mayan-resume.pdf" },
  { path: "/es", pdf: "/caio-mayan-resume.pdf" }, // o currículo do /es é o PDF em inglês
] as const;

for (const { path, pdf } of rotas) {
  const t = rotasTexto[path];
  const lista = (page: Page) => page.getByRole("list", { name: t.contato });
  const nomes = [t.email, "LinkedIn", "GitHub", t.curriculo];

  test.describe(`contato na primeira tela em ${path}`, () => {
    test("não há seção Contato, botão de copiar nem link pra #contato", async ({ page }) => {
      await page.goto(path);
      await expect(page.locator("#contato, .contact, .copy-button, .to-contact")).toHaveCount(0);
      await expect(page.locator('a[href="#contato"]')).toHaveCount(0);
      await expect(page.getByRole("status")).toHaveCount(0);
      await expect(page.getByRole("heading", { name: t.contato, exact: true })).toHaveCount(0);
    });

    test("quatro ícones à direita da faixa, só com ícone, com nome acessível e links certos", async ({ page }) => {
      await page.goto(path);
      const strip = page.locator(".hero-strip");
      await expect(strip.locator(".place")).toBeVisible();
      const icones = lista(page).getByRole("link");
      await expect(icones).toHaveCount(4);
      for (const nome of nomes) {
        const link = lista(page).getByRole("link", { name: nome, exact: true });
        await expect(link).toBeVisible();
        await expect(link).toHaveText("");
        await expect(link.locator("svg").first()).toBeVisible();
      }
      await expect(lista(page).locator('a[href="mailto:mail@caiomayan.com"]')).toHaveCount(1);
      await expect(lista(page).locator('a[href="https://www.linkedin.com/in/caiomayan/"]')).toHaveCount(1);
      await expect(lista(page).locator('a[href="https://github.com/caiomayan"]')).toHaveCount(1);
      expect(await page.locator("a[href^='tel:']").count()).toBe(0);
      // À direita: o último ícone fica depois do lugar.
      const lugar = (await strip.locator(".place").boundingBox())!;
      const ultimo = (await icones.last().boundingBox())!;
      expect(ultimo.x).toBeGreaterThan(lugar.x + lugar.width);
    });

    test("alvos de 44 px", async ({ page }) => {
      await page.goto(path);
      for (const link of await lista(page).getByRole("link").all()) {
        const box = (await link.boundingBox())!;
        // 0,1 px de folga: a caixa é medida em ponto flutuante (43,99994 num quadro do CI) e o alvo é de 44 px.
        expect(box.width).toBeGreaterThanOrEqual(43.9);
        expect(box.height).toBeGreaterThanOrEqual(43.9);
      }
    });

    test("o currículo é o PDF da língua da página e responde 200", async ({ page, request }) => {
      await page.goto(path);
      await expect(page.locator(`a[href="${pdf}"]`)).toBeVisible();
      await expect(page.locator("a[href$='.pdf']")).toHaveCount(1);
      const res = await request.get(pdf);
      expect(res.status()).toBe(200);
      expect(res.headers()["content-type"]).toContain("application/pdf");
    });

    test("uma parada de Tab só, com as setas, Home e End andando entre os ícones", async ({ page }) => {
      await page.goto(path);
      const links = lista(page).getByRole("link");
      const tabIndex = () => links.evaluateAll((els) => els.map((el) => (el as HTMLElement).tabIndex));
      expect(await tabIndex()).toEqual([0, -1, -1, -1]);
      await links.first().focus();
      await page.keyboard.press("ArrowRight");
      await expect(links.nth(1)).toBeFocused();
      await page.keyboard.press("End");
      await expect(links.nth(3)).toBeFocused();
      expect(await tabIndex()).toEqual([-1, -1, -1, 0]);
      await page.keyboard.press("Home");
      await expect(links.first()).toBeFocused();
      await page.keyboard.press("ArrowLeft");
      await expect(links.first()).toBeFocused();
    });

    test("tooltip no hover e no foco: o e-mail mostra o endereço; Esc fecha", async ({ page }) => {
      await page.goto(path);
      const tip = page.locator(".contact-icons .tip");
      for (const nome of nomes) {
        await lista(page).getByRole("link", { name: nome, exact: true }).hover();
        await expect(tip).toHaveText(nome);
        await page.mouse.move(2, 2);
        await expect(tip).toHaveCount(0);
      }
      await lista(page).getByRole("link", { name: "GitHub", exact: true }).focus();
      await expect(tip).toHaveText("GitHub");
      await page.keyboard.press("Escape");
      await expect(tip).toHaveCount(0);
    });

    test("o tooltip não cria rolagem horizontal a 375 e 320 px", async ({ page }) => {
      for (const width of [375, 320]) {
        await page.setViewportSize({ width, height: 700 });
        await page.goto(path);
        await lista(page).getByRole("link").last().focus();
        await expect(page.locator(".contact-icons .tip")).toHaveCount(1);
        const { sw, cw } = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
        expect(sw).toBeLessThanOrEqual(cw);
        const box = (await page.locator(".contact-icons .tip-bubble").boundingBox())!;
        expect(box.x).toBeGreaterThanOrEqual(0);
        expect(box.x + box.width).toBeLessThanOrEqual(width);
      }
    });

    test("telefone não aparece em lugar nenhum", async ({ page }) => {
      await page.goto(path);
      const text = await page.locator("body").innerText();
      expect(text).not.toMatch(/\(?\d{2}\)?\s?9?\d{4}[-\s]?\d{4}/);
    });

    // As molas do Motion em SVG não são WAAPI (document.getAnimations não as vê): mede-se o desenho dos ícones.
    // Grava, quadro a quadro, quantos desenhos diferentes o ícone assume enquanto o hover acontece.
    const desenhosVistos = async (page: Page, alvo: Locator) => {
      await alvo.evaluate((el) => {
        const w = window as unknown as { __vistos: Set<string>; __rodando: number; __rodadas?: number };
        const vistos = new Set<string>();
        const rodada = (w.__rodadas = (w.__rodadas ?? 0) + 1); // cada medição tem a sua rodada: o laço da anterior não escreve na nova
        w.__vistos = vistos;
        w.__rodando = rodada;
        const snap = () =>
          [...el.querySelectorAll("svg *")]
            .map((n) => {
              const c = getComputedStyle(n);
              return `${c.transform}|${c.opacity}|${c.strokeDashoffset}|${c.strokeDasharray}|${n.getAttribute("d")}`;
            })
            .join(";");
        const tick = () => {
          vistos.add(snap());
          if (w.__rodando === rodada) requestAnimationFrame(tick);
        };
        tick();
      });
      await alvo.hover();
      await page.waitForTimeout(900); // mais que a mola/traço inteiro
      return alvo.evaluate(() => {
        const w = window as unknown as { __vistos: Set<string>; __rodando: number };
        w.__rodando = 0;
        return w.__vistos.size;
      });
    };
    const alvos = (page: Page) => [lista(page).getByRole("link", { name: /LinkedIn/ }), lista(page).getByRole("link", { name: t.email, exact: true })];

    test("sem preferência de movimento, o hover muda o desenho dos ícones", async ({ page }) => {
      await page.goto(path);
      for (const alvo of alvos(page)) expect(await desenhosVistos(page, alvo)).toBeGreaterThan(1);
    });

    test("com prefers-reduced-motion, os ícones não mudam no hover", async ({ browser }) => {
      const ctx = await browser.newContext({ reducedMotion: "reduce" });
      const page = await ctx.newPage();
      await page.goto(path);
      await page.waitForLoadState("networkidle"); // hidratação concluída: os ícones já assumiram o estado inicial
      await page.waitForTimeout(500);
      for (const alvo of alvos(page)) expect(await desenhosVistos(page, alvo)).toBe(1);
      await ctx.close();
    });
  });
}
