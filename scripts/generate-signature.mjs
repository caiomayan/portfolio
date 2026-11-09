// Gera lib/signature.ts: os contornos do texto da assinatura, a partir da fonte Lastoria Bold.
// Uso: node scripts/generate-signature.mjs   (ou: npm run signature)
// A fonte é baixada pra scripts/fonts/ (fora do git e fora de public/) e nunca vai pro navegador;
// só os caminhos SVG gerados ficam no repositório. Licença da Lastoria não confirmada: risco assumido pelo Caio.
// Método do componente Signature do componentry.dev (MIT, Harsh Jadhav): um contorno por letra.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import opentype from "opentype.js";

const TEXT = "Caio Mayan";
const FONT_SIZE = 100;
const FONT_URL = "https://componentry.dev/LastoriaBoldRegular.otf";
const FONT_FILE = new URL("./fonts/LastoriaBoldRegular.otf", import.meta.url);
const OUT = new URL("../lib/signature.ts", import.meta.url);
const PAD = 8; // folga em volta (o traço sai um pouco do contorno)

if (!existsSync(FONT_FILE)) {
  await mkdir(new URL("./fonts/", import.meta.url), { recursive: true });
  const res = await fetch(FONT_URL);
  if (!res.ok) throw new Error(`Não baixou a fonte: ${res.status}`);
  await writeFile(FONT_FILE, Buffer.from(await res.arrayBuffer()));
}
const buf = await readFile(FONT_FILE);
const font = opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));

let x = 0;
const glyphs = [];
let box = { x1: Infinity, y1: Infinity, x2: -Infinity, y2: -Infinity };
for (const char of TEXT) {
  const glyph = font.charToGlyph(char);
  const path = glyph.getPath(x, 0, FONT_SIZE);
  const d = path.toPathData(2);
  if (d) {
    const b = path.getBoundingBox();
    box = { x1: Math.min(box.x1, b.x1), y1: Math.min(box.y1, b.y1), x2: Math.max(box.x2, b.x2), y2: Math.max(box.y2, b.y2) };
  }
  glyphs.push(d); // espaço fica como "" (mantém o índice, e o atraso, da letra seguinte)
  x += (glyph.advanceWidth ?? font.unitsPerEm) * (FONT_SIZE / font.unitsPerEm);
}
const r = (n) => Math.round(n * 100) / 100;
const viewBox = `${r(box.x1 - PAD)} ${r(box.y1 - PAD)} ${r(box.x2 - box.x1 + 2 * PAD)} ${r(box.y2 - box.y1 + 2 * PAD)}`;

const out = `// GERADO por scripts/generate-signature.mjs; não editar à mão. Texto: "${TEXT}".
// Contornos da fonte Lastoria Bold (uso por conta e risco do dono do site: licença não confirmada; ver DESIGN.md).
// Não é a assinatura real de ninguém.
export const signature = {
  viewBox: ${JSON.stringify(viewBox)},
  /** Tamanho da fonte em unidades do viewBox (a espessura da máscara de traço usa isso). */
  fontSize: ${FONT_SIZE},
  /** Um caminho por letra; "" é o espaço. */
  glyphs: ${JSON.stringify(glyphs, null, 2).replace(/\n/g, "\n  ")},
} as const;
`;
await writeFile(OUT, out);
console.log(`lib/signature.ts: ${glyphs.filter(Boolean).length} letras, viewBox ${viewBox}`);
