import { expect, test } from "@playwright/test";

// Issue #28: com as duas APIs falhando (projeto "apis-falhando": build com o Open-Meteo em 500 e o GitHub em 502, mesmo com token),
// a página renderiza normalmente, sem o clima, sem o gráfico e sem erro no console.
const rotas = [
  { path: "/", cidade: "João Pessoa, Brasil", contato: "Contato" },
  { path: "/en", cidade: "João Pessoa, Brazil", contato: "Contact" },
] as const;

for (const r of rotas) {
  test(`${r.path}: sem clima e sem gráfico quando as APIs falham, o resto da página segue normal`, async ({ page }) => {
    const erros: string[] = [];
    page.on("console", (m) => m.type() === "error" && erros.push(m.text()));
    page.on("pageerror", (e) => erros.push(e.message));
    const res = await page.goto(r.path);
    expect(res!.status()).toBe(200);
    await expect(page.locator("section.activity")).toHaveCount(0);
    await expect(page.locator(".contact-map-weather")).toHaveCount(0);
    await expect(page.locator(".weather-credit")).toHaveCount(0);
    await expect(page.getByText(/°C/)).toHaveCount(0);
    // O resto do Contato (e-mail, mapa, hora) continua.
    await expect(page.getByRole("heading", { level: 2, name: r.contato })).toBeVisible();
    await expect(page.locator('a[href="mailto:mail@caiomayan.com"]')).toBeVisible();
    await expect(page.locator(".contact-map-place")).toHaveText(r.cidade);
    await page.locator(".contact-map").scrollIntoViewIfNeeded();
    await expect(page.locator(".contact-map-time")).toHaveText(/\d{2}:\d{2} \(UTC−3\)/);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.waitForLoadState("networkidle");
    expect(erros).toEqual([]);
  });
}
