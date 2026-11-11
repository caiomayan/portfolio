import AxeBuilder from "@axe-core/playwright";
import { assentarTudo, expect, test, type Page } from "./base";

// Issue #41: o seletor de idioma e o botão de tema acompanham a rolagem numa cápsula flutuante (uma cópia só no DOM).
declare global {
  interface Window {
    __marca?: number;
  }
}

const idioma = (page: Page) => page.getByRole("button", { name: /^(Idioma|Language)/ });
const tema = (page: Page) => page.getByRole("button", { name: /tema|theme/i });
const capsula = (page: Page) => page.locator(".top-actions");
/** Espera as animações de entrada acabarem (opacidade cheia): o axe mede o contraste com o que está na tela. */
const pousada = (page: Page) =>
  expect
    .poll(() => page.evaluate(() => document.getAnimations().filter((a) => a.playState === "running" && a.effect?.getComputedTiming().iterations !== Infinity).length))
    .toBe(0); // também as entradas da primeira tela (o pino do mapa pulsa pra sempre e fica de fora)
const rolarPara = async (page: Page, y: number) => {
  await page.evaluate((v) => window.scrollTo(0, v), y);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(y - 5);
};

test("no topo os controles ficam na barra; depois de rolar viram uma cápsula fixa no canto e voltam ao topo", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await expect(capsula(page)).not.toHaveAttribute("data-floating", /.*/);
  expect(await capsula(page).evaluate((el) => getComputedStyle(el).position)).not.toBe("fixed");
  expect((await capsula(page).boundingBox())!.y).toBeLessThan(122);

  await rolarPara(page, 1500);
  await expect(capsula(page)).toHaveAttribute("data-floating", "true");
  await expect(idioma(page)).toBeInViewport();
  await expect(tema(page)).toBeInViewport();
  const css = await capsula(page).evaluate((el) => {
    const s = getComputedStyle(el);
    return { position: s.position, blur: s.backdropFilter, borda: s.borderTopWidth, sombra: s.boxShadow, fundo: s.backgroundColor };
  });
  expect(css.position).toBe("fixed");
  expect(css.blur).toContain("blur");
  expect(css.borda).toBe("1px");
  expect(css.sombra).not.toBe("none");
  expect(css.fundo).toMatch(/rgba|color\(|\//); // translúcido
  // Alinhada à borda direita do contêiner (1120 px centrados) e perto do topo.
  await expect.poll(async () => Math.abs((await capsula(page).boundingBox())!.x + (await capsula(page).boundingBox())!.width - (1440 + 1120) / 2)).toBeLessThanOrEqual(2);
  expect((await capsula(page).boundingBox())!.y).toBeLessThan(24);

  await rolarPara(page, 0);
  await expect(capsula(page)).not.toHaveAttribute("data-floating", /.*/);
  await expect.poll(() => capsula(page).evaluate((el) => getComputedStyle(el).position)).not.toBe("fixed");
});

test("os controles existem uma vez só e a assinatura não flutua", async ({ page }) => {
  await page.goto("/");
  await rolarPara(page, 1500);
  await expect(idioma(page)).toHaveCount(1);
  await expect(tema(page)).toHaveCount(1);
  await expect(capsula(page)).toHaveCount(1);
  const assinatura = (await page.locator(".signature-mark").boundingBox())!;
  expect(assinatura.y + assinatura.height).toBeLessThan(0); // saiu da tela com a rolagem
});

test("a ordem do Tab continua lógica: idioma, tema, depois o conteúdo", async ({ page }) => {
  await page.goto("/");
  await rolarPara(page, 1500);
  const ordem = await page.evaluate(() =>
    [...document.querySelectorAll<HTMLElement>("a[href], button")].slice(0, 2).map((e) => e.className),
  );
  expect(ordem[0]).toContain("lang-button");
  expect(ordem[1]).toContain("theme-toggle");
});

test("rolado, troca de tema e de idioma pela cápsula: sem recarregar, a rolagem e o tema ficam", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.evaluate(() => {
    window.__marca = 7;
  });
  await rolarPara(page, 1500);
  await expect(capsula(page)).toHaveAttribute("data-floating", "true");

  await tema(page).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  expect(await page.evaluate(() => scrollY)).toBeGreaterThan(1400);

  await idioma(page).click();
  const menu = page.getByRole("menu");
  await expect(menu).toBeVisible();
  await expect(menu).toBeInViewport({ ratio: 1 }); // abre dentro da tela
  await page.getByRole("menuitemradio", { name: "English" }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  expect(new URL(page.url()).pathname).toBe("/en");
  expect(await page.evaluate(() => window.__marca)).toBe(7); // sem recarregar
  expect(await page.evaluate(() => scrollY)).toBeGreaterThan(1300);
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  // A barra do topo é recriada na troca: a cápsula continua lá, flutuando, sem voltar ao topo.
  await expect(capsula(page)).toHaveAttribute("data-floating", "true");
  await expect(idioma(page)).toBeInViewport();
  await expect(idioma(page)).toBeFocused();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Software Engineer");
});

for (const [w, h] of [
  [1440, 900],
  [375, 667],
  [320, 640],
] as const) {
  for (const escuro of [false, true]) {
    test(`cápsula a ${w}×${h} no tema ${escuro ? "escuro" : "claro"}: alvos de 44 px, sem rolagem lateral, axe e console limpos`, async ({ page }) => {
      const erros: string[] = [];
      page.on("console", (m) => m.type() === "error" && erros.push(m.text()));
      page.on("pageerror", (e) => erros.push(e.message));
      await page.setViewportSize({ width: w, height: h });
      await page.goto("/");
      if (escuro) await tema(page).click();
      await rolarPara(page, 1500);
      await expect(capsula(page)).toHaveAttribute("data-floating", "true");
      await pousada(page);
      await assentarTudo(page); // a coreografia das seções (#39) tem que ter assentado: o axe mede o contraste do que está na tela
      for (const b of [await idioma(page).boundingBox(), await tema(page).boundingBox()]) {
        expect(b!.width).toBeGreaterThanOrEqual(43.9);
        expect(b!.height).toBeGreaterThanOrEqual(43.9);
      }
      const cap = (await capsula(page).boundingBox())!;
      expect(cap.x).toBeGreaterThanOrEqual(0);
      expect(cap.x + cap.width).toBeLessThanOrEqual(w);
      await idioma(page).click();
      await expect(page.getByRole("menu")).toBeInViewport({ ratio: 1 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      const axe = await new AxeBuilder({ page }).analyze();
      expect(axe.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.html.slice(0, 90) + " " + (n.any[0]?.message ?? "")).join(" | ")}`)).toEqual([]);
      expect(erros).toEqual([]);
    });
  }
}

test.describe("movimento reduzido", () => {
  test.use({ reducedMotion: "reduce" });
  test("a cápsula aparece e some sem animação", async ({ page }) => {
    await page.goto("/");
    await rolarPara(page, 1500);
    await expect(capsula(page)).toHaveAttribute("data-floating", "true");
    expect(await capsula(page).evaluate((el) => el.getAnimations().length)).toBe(0);
    await rolarPara(page, 0);
    await expect(capsula(page)).not.toHaveAttribute("data-floating", /.*/);
  });
});

test("o backdrop-filter só existe na cápsula e não é animado", async ({ page }) => {
  await page.goto("/");
  await rolarPara(page, 1500);
  await expect(capsula(page)).toHaveAttribute("data-floating", "true");
  const comBlur = await page.evaluate(() =>
    [...document.querySelectorAll<HTMLElement>("body *")].filter((e) => getComputedStyle(e).backdropFilter !== "none").map((e) => e.className),
  );
  expect(comBlur).toEqual(["top-actions"]);
  const css = await page.evaluate(() => [...document.styleSheets].flatMap((s) => [...s.cssRules]).map((r) => r.cssText).join("\n"));
  expect(css).not.toMatch(/transition:[^;}]*backdrop-filter/);
});
