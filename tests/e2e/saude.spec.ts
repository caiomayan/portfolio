import { expect, test } from "@playwright/test";

// Fora da Vercel o site não pede o script do Analytics (daria 404 e erro no console).
for (const path of ["/", "/en"]) {
  test(`${path}: sem erro de console nem requisição falha`, async ({ page }) => {
    const problemas: string[] = [];
    page.on("console", (m) => m.type() === "error" && problemas.push(`console: ${m.text()}`));
    page.on("pageerror", (e) => problemas.push(`pageerror: ${e.message}`));
    page.on("response", (r) => r.status() >= 400 && problemas.push(`${r.status()} ${r.url()}`));
    await page.goto(path, { waitUntil: "networkidle" });
    expect(problemas).toEqual([]);
  });
}
