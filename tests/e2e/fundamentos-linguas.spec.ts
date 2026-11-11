import { assentar, expect, test } from "./base";
import { rotasTexto, type RotaTexto } from "./textos";

// Texto: docs/copy-deck.md (seções Fundamentos, Formação, Experiência e Idiomas). Issues #27, #29 e #38.
for (const path of ["/", "/en", "/es"] as RotaTexto[]) {
  const t = rotasTexto[path];
  test.describe(`fundamentos, ícones e línguas em ${path}`, () => {
    test("seção Fundamentos entre Formação e Atividade: três grupos de texto, na ordem do copy deck, sem ícones", async ({ page }) => {
      await page.goto(path);
      const sec = page.locator("#fundamentos");
      await expect(sec.getByRole("heading", { level: 2, name: t.fundamentos.heading })).toBeVisible();
      const grupos = sec.locator(".foundation-group");
      await expect(grupos).toHaveCount(3);
      for (const [i, g] of t.fundamentos.grupos.entries()) {
        const grupo = grupos.nth(i);
        await expect(grupo.getByRole("heading", { level: 3 })).toHaveText(g.rotulo);
        await expect(grupo.locator("li")).toHaveCount(3);
        for (const [j, [nome, detalhe]] of g.itens.entries()) {
          const li = grupo.locator("li").nth(j);
          await expect(li.locator(".foundation-name")).toHaveText(nome);
          if (detalhe) await expect(li.locator(".foundation-detail")).toHaveText(detalhe);
          else await expect(li.locator(".foundation-detail")).toHaveCount(0);
        }
      }
      expect(t.fundamentos.grupos[0].rotulo).not.toBe(t.fundamentos.heading);
      await expect(sec.locator("img, svg")).toHaveCount(0);
      await expect(page.locator("#tecnologias")).toHaveCount(0);
      const tops = await Promise.all([page.locator("#formacao"), sec, page.locator("#idiomas")].map(async (l) => (await l.boundingBox())!.y));
      expect(tops).toEqual([...tops].sort((a, b) => a - b));
    });

    for (const [secao, chave] of [["#formacao", "noCurso"], ["#experiencia", "feitoCom"]] as const) {
      test(`${secao}: linha de ícones "${chave}" com rótulo, nomes no tooltip, logos carregados`, async ({ page }) => {
        await page.goto(path);
        const { rotulo, nomes } = t[chave];
        const linha = page.locator(`${secao} .icon-row`);
        await expect(linha).toHaveCount(1);
        await expect(linha.locator(".icon-row-label")).toHaveText(rotulo);
        const itens = linha.locator(".stack li");
        await expect(itens).toHaveCount(nomes.length);
        for (const [i, nome] of nomes.entries()) {
          await expect(itens.nth(i)).toHaveText("");
          await expect(itens.nth(i).getByRole("img", { name: nome, exact: true })).toBeVisible();
        }
        for (const img of await linha.locator("img").all()) {
          expect(await img.evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth > 0)).toBe(true);
        }
        await assentar(page, `${secao} .icon-row .stack li`);
        const tip = page.locator(`${secao} .tip`);
        await expect(tip).toHaveCount(0);
        await itens.nth(1).hover();
        await expect(tip).toHaveText(nomes[1]);
        await expect(tip).toHaveAttribute("aria-hidden", "true");
        await page.mouse.move(2, 2);
        await expect(tip).toHaveCount(0);
        await itens.nth(2).locator(".stack-icon").focus();
        await expect(tip).toHaveText(nomes[2]);
        await page.keyboard.press("Escape");
        await expect(tip).toHaveCount(0);
      });
    }

    test("a linha do curso fica abaixo da descrição e acima da monitoria; a da TechEduConnect depois das linhas", async ({ page }) => {
      await page.goto(path);
      const y = async (sel: string) => (await page.locator(sel).first().boundingBox())!.y;
      expect(await y("#formacao .icon-row")).toBeGreaterThan(await y("#formacao .entry-sub >> nth=-1"));
      expect(await y("#formacao .entry-child")).toBeGreaterThan(await y("#formacao .icon-row"));
      expect(await y("#experiencia .icon-row")).toBeGreaterThan(await y("#experiencia .entry:first-child .entry-lines li >> nth=-1"));
    });

    test("logos pretos invertem no tema escuro, em todas as linhas de ícones", async ({ page }) => {
      await page.goto(path);
      await page.getByRole("button", { name: t.tema }).click();
      for (const secao of ["#formacao", "#experiencia"]) {
        const filtros = await page.locator(`${secao} .stack img`).evaluateAll((els) => els.map((el) => getComputedStyle(el).filter));
        for (const f of filtros) expect(f).toContain("invert");
      }
    });

    test("Idiomas é a última seção, depois de Atividade, com o título das outras e sem bandeiras", async ({ page }) => {
      await page.goto(path);
      const sec = page.locator("#idiomas");
      await expect(sec.getByRole("heading", { level: 2, name: t.linguas.heading })).toBeVisible();
      // Título igual ao das outras seções.
      const titulo = (sel: string) => page.locator(sel).evaluate((el) => { const c = getComputedStyle(el); return [c.fontSize, c.fontWeight, c.letterSpacing, c.color].join("|"); });
      expect(await titulo("#idiomas h2")).toBe(await titulo("#fundamentos h2"));
      // Ordem: ... Atividade (quando há dados), Idiomas, rodapé; e nenhuma seção depois.
      const ids = await page.locator("main > section").evaluateAll((els) => els.map((e) => e.id));
      expect(ids.at(-1)).toBe("idiomas");
      expect(ids.indexOf("idiomas")).toBeGreaterThan(ids.indexOf("fundamentos"));
      expect(ids.indexOf("atividade")).toBeLessThan(ids.indexOf("idiomas"));
      await expect(page.locator("svg[data-flag], .lang-flag")).toHaveCount(0);
      await expect(page.locator("#contato, .contact")).toHaveCount(0);
    });

    test("Idiomas: duas linhas de duas pontas e o subnível no estilo da monitoria; sem espanhol", async ({ page }) => {
      await page.goto(path);
      const sec = page.locator("#idiomas");
      const linhas = sec.locator("li.language");
      await expect(linhas).toHaveCount(t.linguas.itens.length);
      await sec.scrollIntoViewIfNeeded();
      for (const [i, [nome, nivel, sub]] of t.linguas.itens.entries()) {
        const li = linhas.nth(i);
        await expect(li.locator(".language-name")).toHaveText(nome);
        await expect(li.locator(".language-level")).toHaveText(nivel);
        if (sub) {
          await expect(li.locator(".language-sub")).toHaveText(sub);
          await expect(li.locator(".language-sub svg")).toHaveCount(1); // ícone de hierarquia, como na monitoria
        } else {
          await expect(li.locator(".language-sub")).toHaveCount(0);
        }
      }
      // O subnível fica logo abaixo do inglês (primeira linha), e o português vem depois.
      await expect
        .poll(async () => {
          const nome = (await linhas.first().locator(".language-name").boundingBox())!;
          const nivel = (await linhas.first().locator(".language-level").boundingBox())!;
          const li = (await linhas.first().boundingBox())!;
          const sub = (await linhas.first().locator(".language-sub").boundingBox())!;
          const port = (await linhas.nth(1).boundingBox())!;
          return nome.x < nivel.x && Math.abs(nivel.x + nivel.width - (li.x + li.width)) < 2 && sub.y >= nome.y + nome.height - 1 && port.y >= sub.y + sub.height - 1;
        })
        .toBe(true);
      expect(await sec.innerText()).not.toMatch(/Español|Spanish|Espanhol|Spanisch/i);
    });

    test("Idiomas: nome em --ink, nível em --soft", async ({ page }) => {
      await page.goto(path);
      const cor = (sel: string) => page.locator(sel).first().evaluate((el) => getComputedStyle(el).color);
      const [nome, nivel] = await Promise.all([cor("#idiomas .language-name"), cor("#idiomas .language-level")]);
      expect(nome).not.toBe(nivel);
    });

    test("não rola na horizontal a 375 px", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto(path);
      const { sw, cw } = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
      expect(sw).toBeLessThanOrEqual(cw);
    });
  });
}
