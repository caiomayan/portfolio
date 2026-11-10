import { expect, test } from "@playwright/test";

// Issue #28: clima de João Pessoa ao lado da hora e gráfico de contribuições do GitHub, ambos buscados no servidor.
// O build testado lê o Open-Meteo e o GitHub de um servidor falso (tests/fixtures/apis.mjs): 27,6 °C com tempo parcialmente nublado e
// 53 semanas de contribuições, 1234 no total. O token abaixo é só do servidor falso.
const TOKEN_FALSO = "token-de-teste-nao-e-segredo";

const rotas = [
  { path: "/", clima: "Parcialmente nublado", titulo: "Atividade", total: "1.234 contribuições no último ano", credito: "Dados do clima por" },
  { path: "/en", clima: "Partly cloudy", titulo: "Activity", total: "1,234 contributions in the last year", credito: "Weather data by" },
] as const;

for (const r of rotas) {
  test.describe(`dados ao vivo em ${r.path}`, () => {
    test("clima na primeira tela, ao lado da hora, no HTML do servidor, com ícone da noite; crédito no fim do Contato", async ({ page, request }) => {
      const html = await (await request.get(r.path)).text();
      expect(html).toContain("28°C");
      await page.goto(r.path);
      const clima = page.locator(".place-weather");
      
      await expect(clima).toContainText("28°C");
      await expect(clima).toContainText(r.clima); // nome do tempo, só pra leitor de tela
      await expect(clima.locator("svg")).toHaveCount(1);
      await expect(clima.locator("svg")).toHaveAttribute("aria-hidden", "true");
      // O servidor falso responde is_day: 0 (noite): parcialmente nublado vira nuvem com lua, não nuvem com sol.
      await expect(clima.locator("svg")).toHaveClass(/lucide-cloud-moon/);
      await expect(clima.locator("svg")).not.toHaveClass(/lucide-cloud-sun/);
      // Ao lado da hora (mesma linha da legenda do mapa), sem mexer no texto da hora.
      await expect(page.locator(".place-time")).toHaveText(/^\d{2}:\d{2} \(UTC−3\)$/);
      const [t, c] = await Promise.all([page.locator(".place-time").boundingBox(), clima.boundingBox()]);
      expect(Math.abs(t!.y - c!.y)).toBeLessThan(12);
      expect(c!.x).toBeGreaterThan(t!.x);
      // Crédito CC BY 4.0 do Open-Meteo: no fim do Contato (nunca na primeira tela), depois das línguas.
      await expect(page.locator(".hero .weather-credit")).toHaveCount(0);
      const credito = page.locator(".contact .weather-credit");
      await credito.scrollIntoViewIfNeeded();
      const [lg, cr] = await Promise.all([page.locator(".contact .contact-languages").boundingBox(), credito.boundingBox()]);
      expect(cr!.y).toBeGreaterThan(lg!.y + lg!.height - 1);
      await expect(credito).toContainText(r.credito);
      await expect(credito.getByRole("link", { name: "Open-Meteo.com" })).toHaveAttribute("href", "https://open-meteo.com/");
    });

    test("gráfico de contribuições antes do Contato, com título e total", async ({ page }) => {
      await page.goto(r.path);
      const secao = page.locator("section.activity");
      await expect(secao.getByRole("heading", { level: 2, name: r.titulo })).toBeVisible();
      await expect(secao.locator(".activity-total")).toHaveText(r.total);
      await expect(secao.getByRole("img", { name: r.total })).toHaveCount(1);
      const ordem = await page.evaluate(() => [...document.querySelectorAll("section")].map((s) => s.className || s.id));
      expect(ordem.indexOf("activity")).toBe(ordem.indexOf("contact") - 1);
      // 53 semanas de 7 dias.
      await expect(secao.locator(".activity-week")).toHaveCount(53);
      await expect(secao.locator(".activity-day")).toHaveCount(53 * 7);
    });

    test("o gráfico é preto e branco nos dois temas: cinza puro, 5 tons, e nenhum verde da API", async ({ page }) => {
      for (const tema of ["light", "dark"]) {
        await page.addInitScript((tm) => localStorage.setItem("theme", tm), tema);
        await page.goto(r.path);
        const cores = await page.locator(".activity-day").evaluateAll((els) => els.map((e) => getComputedStyle(e).backgroundColor));
        const distintas = new Set(cores);
        expect(distintas.size).toBe(5);
        for (const c of distintas) {
          const [R, G, B] = c.match(/[\d.]+/g)!.map(Number);
          expect(Math.abs(R - G), c).toBeLessThanOrEqual(6);
          expect(Math.abs(G - B), c).toBeLessThanOrEqual(6);
        }
      }
    });

    test("o gráfico não anima nada", async ({ page }) => {
      await page.goto(r.path);
      await page.locator("section.activity").scrollIntoViewIfNeeded();
      expect(await page.locator(".activity-grid, .activity-grid *").evaluateAll((els) => els.flatMap((e) => e.getAnimations()).length)).toBe(0);
    });

    test("a 375 px a página não rola de lado: a grade rola dentro do bloco, aberta nas semanas mais recentes, e dá pra focar com o teclado", async ({ browser }) => {
      const ctx = await browser.newContext({ viewport: { width: 375, height: 800 } });
      const p = await ctx.newPage();
      await p.goto(r.path);
      await p.locator("section.activity").scrollIntoViewIfNeeded();
      expect(await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      const rolagem = p.locator(".activity-scroll");
      const m = await rolagem.evaluate((el) => ({ scrollWidth: el.scrollWidth, clientWidth: el.clientWidth }));
      expect(m.scrollWidth).toBeGreaterThan(m.clientWidth);
      const box = (await rolagem.boundingBox())!;
      expect(box.x + box.width).toBeLessThanOrEqual(375);
      // Abre nas semanas mais recentes: a última semana está à vista e a primeira, fora (à esquerda).
      const ultima = (await p.locator(".activity-week").last().boundingBox())!;
      const primeira = (await p.locator(".activity-week").first().boundingBox())!;
      expect(ultima.x).toBeGreaterThanOrEqual(box.x - 1);
      expect(ultima.x + ultima.width).toBeLessThanOrEqual(box.x + box.width + 1);
      expect(primeira.x + primeira.width).toBeLessThan(box.x);
      await rolagem.focus();
      await expect(rolagem).toBeFocused();
      await ctx.close();
    });

    test("no desktop a grade inteira cabe e fica à esquerda, sem rolagem", async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto(r.path);
      const rolagem = page.locator(".activity-scroll");
      await rolagem.scrollIntoViewIfNeeded();
      const m = await rolagem.evaluate((el) => ({ sw: el.scrollWidth, cw: el.clientWidth }));
      expect(m.sw).toBeLessThanOrEqual(m.cw);
      const [a, h] = await Promise.all([page.locator(".activity-week").first().boundingBox(), page.locator("section.activity h2").boundingBox()]);
      expect(Math.abs(a!.x - h!.x)).toBeLessThanOrEqual(2);
    });

    test("o token do GitHub nunca vai pro cliente: nem no HTML, nem no JavaScript, nem em pedido do navegador", async ({ page, request }) => {
      const html = await (await request.get(r.path)).text();
      expect(html).not.toContain(TOKEN_FALSO);
      expect(html).not.toContain("GITHUB_TOKEN");
      const scripts = [...html.matchAll(/(?:src|href)="(\/_next\/static\/[^"]+\.js)"/g)].map((m) => m[1]);
      expect(scripts.length).toBeGreaterThan(0);
      for (const src of scripts) {
        const js = await (await request.get(src)).text();
        expect(js, src).not.toContain(TOKEN_FALSO);
        expect(js, src).not.toContain("GITHUB_TOKEN");
      }
      // O navegador nunca conversa com as APIs: nenhum pedido pra elas durante a visita.
      const pedidos: string[] = [];
      page.on("request", (rq) => pedidos.push(rq.url()));
      await page.goto(r.path);
      await page.waitForLoadState("networkidle");
      expect(pedidos.filter((u) => /open-meteo|api\.github\.com|127\.0\.0\.1:3199/.test(u))).toEqual([]);
    });
  });
}
