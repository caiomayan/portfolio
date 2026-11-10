// Procura termos proibidos em arquivos versionados (CI) ou em stage (pre-commit).
// Os termos vêm de FORBIDDEN_TERMS (separados por "|") ou de um arquivo (--terms-file, um por linha ou separados por "|").
// Casa sem diferenciar maiúsculas de minúsculas, como texto literal. NUNCA imprime o termo: só arquivo e linha.
//
// Uso:
//   node scripts/check-forbidden-terms.mjs               # todos os arquivos versionados (usa env FORBIDDEN_TERMS)
//   node scripts/check-forbidden-terms.mjs --staged --terms-file <arquivo>   # conteúdo em stage
// Saída: 0 = limpo (ou sem lista, com aviso), 1 = achou.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const IGNORED = new Set(["package-lock.json"]);

export function parseTerms(raw) {
  return [...new Set(
    raw
      .split(/[|\r\n]/)
      .map((t) => t.trim())
      .filter((t) => t && !t.startsWith("#"))
      .map((t) => t.toLowerCase()),
  )];
}

export function isBinary(buffer) {
  return buffer.subarray(0, 8000).includes(0);
}

// Devolve as linhas (1-based) do texto que contêm algum termo.
export function findLines(text, terms) {
  const hits = [];
  text.split(/\r?\n/).forEach((line, i) => {
    const lower = line.toLowerCase();
    if (terms.some((t) => lower.includes(t))) hits.push(i + 1);
  });
  return hits;
}

function git(args) {
  return execFileSync("git", args, { maxBuffer: 256 * 1024 * 1024 });
}

function listFiles(staged) {
  const args = staged
    ? ["diff", "--cached", "--name-only", "--diff-filter=ACMR", "-z"]
    : ["ls-files", "-z"];
  return git(args).toString("utf8").split("\0").filter(Boolean);
}

function readContent(file, staged) {
  return staged ? git(["show", `:${file}`]) : readFileSync(file);
}

function main() {
  const argv = process.argv.slice(2);
  const staged = argv.includes("--staged");
  const fileFlag = argv.indexOf("--terms-file");
  let raw = process.env.FORBIDDEN_TERMS ?? "";
  if (fileFlag !== -1) {
    try {
      raw = readFileSync(argv[fileFlag + 1], "utf8");
    } catch {
      raw = "";
    }
  }
  const terms = parseTerms(raw);
  if (terms.length === 0) {
    console.warn("Aviso: lista de termos proibidos vazia ou ausente; verificação pulada.");
    return 0;
  }

  let found = 0;
  for (const file of listFiles(staged)) {
    if (IGNORED.has(file.split("/").pop())) continue;
    let buf;
    try {
      buf = readContent(file, staged);
    } catch {
      continue; // arquivo apagado ou submódulo
    }
    if (isBinary(buf)) continue;
    for (const line of findLines(buf.toString("utf8"), terms)) {
      console.error(`Termo proibido em ${file}:${line}`);
      found++;
    }
  }
  if (found > 0) {
    console.error(`${found} ocorrência(s) de termo proibido (o termo não é impresso).`);
    return 1;
  }
  console.log("Nenhum termo proibido nos arquivos verificados.");
  return 0;
}

if (process.argv[1]?.endsWith("check-forbidden-terms.mjs")) {
  process.exit(main());
}
