import { expect, test, type Page } from "@playwright/test";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

/*
 * Termos proibidos: a lista real vem da variável de ambiente FORBIDDEN_TERMS (termos separados por "|", sem diferenciar
 * maiúsculas de minúsculas). Fica fora do repositório: secret no CI, ambiente local no PC. Sem a variável, o teste FALHA.
 *
 * O repositório é público e o log do CI também: NUNCA imprimir o termo nem trechos ao redor. As mensagens dizem só o
 * número do termo e onde ele apareceu.
 */

// Padrão de telefone brasileiro, fixo (não é segredo).
const PHONE = /\(?\d{2}\)?\s?9?\s?\d{4}-?\d{4}/;

const NEXT_ASSET = /\/_next\/[^"'\s\)]+/g;

// Em PR vindo de fork os secrets não existem: aí, e só aí, o teste é pulado com aviso (FORK_PR vem do workflow).
const forkPr = process.env.FORK_PR === "true";

const terms = (process.env.FORBIDDEN_TERMS ?? "")
  .split("|")
  .map((t) => t.trim().toLowerCase())
  .filter(Boolean);

const rotas = ["/", "/en"] as const;
const pdfs = ["/caio-mayan-curriculo.pdf", "/caio-mayan-resume.pdf"] as const;

/** Procura os termos e o telefone em `text`; devolve só rótulos, nunca o conteúdo achado. */
function scan(text: string, where: string): string[] {
  const hay = text.toLowerCase();
  const found: string[] = [];
  terms.forEach((t, i) => {
    if (hay.includes(t)) found.push(`termo #${i + 1} em ${where}`);
  });
  // Caminhos de assets do Next (/_next/static/...) levam hashes numéricos que casam com o padrão: saem só da checagem de telefone.
  if (PHONE.test(text.replace(NEXT_ASSET, ""))) found.push(`padrão de telefone em ${where}`);
  return found;
}

async function visibleAndAttributes(page: Page): Promise<string> {
  return page.evaluate(() => {
    const parts: string[] = [document.title, document.body.innerText];
    for (const el of document.querySelectorAll("*")) {
      for (const a of ["alt", "title", "aria-label", "href", "content"]) {
        const v = el.getAttribute(a);
        if (v) parts.push(v);
      }
    }
    return parts.join("\n");
  });
}

async function pdfText(path: string, baseURL: string): Promise<string> {
  const res = await fetch(new URL(path, baseURL));
  const data = new Uint8Array(await res.arrayBuffer());
  const doc = await getDocument({ data }).promise;
  let text = "";
  for (let p = 1; p <= doc.numPages; p++) {
    const content = await (await doc.getPage(p)).getTextContent();
    text += content.items.map((i) => ("str" in i ? i.str : "")).join(" ") + "\n";
  }
  return text;
}

test.describe("termos proibidos", () => {
  test.skip(forkPr, "FORBIDDEN_TERMS indisponível em PR de fork: checagem pulada, o CI do repositório principal roda de novo.");

  test("a variável FORBIDDEN_TERMS existe e tem pelo menos um termo", () => {
    expect(terms.length, "FORBIDDEN_TERMS ausente ou vazia: sem lista não há o que checar").toBeGreaterThan(0);
  });

  for (const rota of rotas) {
    test(`${rota}: texto visível, atributos e HTML sem termos nem telefone`, async ({ page }) => {
      const res = await page.goto(rota);
      const html = await res!.text();
      const rendered = await visibleAndAttributes(page);
      const problems = [...scan(html, `HTML de ${rota}`), ...scan(rendered, `texto e atributos de ${rota}`)];
      expect(problems.length === 0, `Achados: ${problems.join("; ")}`).toBe(true);
    });
  }

  for (const pdf of pdfs) {
    test(`${pdf}: texto do PDF sem termos nem telefone`, async ({ baseURL }) => {
      const text = await pdfText(pdf, baseURL!);
      // Prova de que a extração funciona: sem isso a checagem seria vazia.
      expect(/caio/i.test(text), "extração de texto do PDF não encontrou o nome: checagem seria vazia").toBe(true);
      const problems = scan(text, pdf);
      expect(problems.length === 0, `Achados: ${problems.join("; ")}`).toBe(true);
    });
  }

  test("a própria checagem detecta um termo e um telefone (autoteste com valores falsos)", () => {
    expect(PHONE.test("fale em (83) 99999-1234")).toBe(true);
    expect(PHONE.test("outubro de 2026")).toBe(false);
    const hay = "Texto com Palavra-Falsa no meio".toLowerCase();
    expect(hay.includes("palavra-falsa")).toBe(true);
  });
});
