import { expect, test } from "@playwright/test";

// Tamanhos de ícone vêm dos tokens do CSS (DESIGN.md): conferimos o resultado na página.
for (const path of ["/", "/en"]) {
  test(`${path}: ícones com os tamanhos dos tokens`, async ({ page }) => {
    await page.goto(path);
    const size = (sel: string) =>
      page.locator(sel).evaluateAll((els) => els.map((e) => `${getComputedStyle(e).width} x ${getComputedStyle(e).height}`));
    const all = (arr: string[], v: string) => arr.length > 0 && arr.every((x) => x === v);
    expect(all(await size("#carmine .stack-logo-empty svg"), "20px x 20px")).toBe(true);
    expect(all(await size("#carmine .stack img"), "20px x 20px")).toBe(true);
    expect(all(await size("#tecnologias .stack-logo-empty svg"), "20px x 20px")).toBe(true);
    expect(all(await size("#tecnologias .stack img"), "20px x 20px")).toBe(true);
    expect(all(await size(".contact-link .icon svg, .copy-button svg, .theme-toggle svg"), "20px x 20px")).toBe(true);
  });
}
