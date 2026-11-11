import { expect, test } from "./base";

// Issue #28: com as duas APIs falhando (projeto "apis-falhando": build com o Open-Meteo em 500 e o GitHub em 502, mesmo com token),
// a página renderiza normalmente, sem o clima, sem o gráfico e sem erro no console.
const rotas = [
  { path: "/", cidade: "João Pessoa, Brasil", contato: "Contato" },
  { path: "/en", cidade: "João Pessoa, Brazil", contato: "Contact" },
  { path: "/es", cidade: "João Pessoa, Brasil", contato: "Contacto" },
] as const;

for (const r of rotas) {
  test(`${r.path}: sem clima e sem gráfico quando as APIs falham, o resto da página segue normal`, async ({ page }) => {
    const erros: string[] = [];
    page.on("console", (m) => m.type() === "error" && erros.push(m.text()));
    page.on("pageerror", (e) => erros.push(e.message));
    const res = await page.goto(r.path);
    expect(res!.status()).toBe(200);
    await expect(page.locator("section.activity")).toHaveCount(0);
    await expect(page.locator(".place-weather")).toHaveCount(0);
    await expect(page.locator(".weather-credit")).toHaveCount(0);
    await expect(page.getByText(/°C/)).toHaveCount(0);
    // O resto da página (contato, mapa, hora, idiomas) continua.
    await expect(page.getByRole("list", { name: r.contato }).getByRole("link")).toHaveCount(4);
    await expect(page.locator("#idiomas")).toBeVisible();
    await expect(page.locator(".hero .place-city")).toHaveText(r.cidade);
    await expect(page.locator(".place-time")).toHaveText(/^\d{2}:\d{2}$/);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await page.waitForLoadState("networkidle");
    expect(erros).toEqual([]);
  });
}
