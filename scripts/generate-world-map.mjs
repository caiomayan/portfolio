// Gera lib/world-map.ts: o mapa-múndi em pontos (projeção equiretangular), a partir do Natural Earth (domínio público).
// Uso: node scripts/generate-world-map.mjs   (ou: npm run world-map)
// O GeoJSON (ne_110m_land) é baixado pra scripts/data/ (fora do git) e nunca vai pro navegador; só os pontos gerados
// ficam no repositório. Nada é baixado em tempo de execução. Método: grade regular de pontos, mantendo os que caem em terra.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";

const URL_DATA = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_land.geojson";
const FILE = new URL("./data/ne_110m_land.geojson", import.meta.url);
const OUT = new URL("../lib/world-map.ts", import.meta.url);

// Projeção: 1 unidade = 0,5° (x = (lon + 180) * 2, y = (LAT_TOP - lat) * 2). Faixa de latitude sem os polos.
const SCALE = 2;
const LAT_TOP = 78;
const LAT_BOTTOM = -58;
const STEP = 2.5; // graus entre pontos

if (!existsSync(FILE)) {
  await mkdir(new URL("./data/", import.meta.url), { recursive: true });
  const res = await fetch(URL_DATA);
  if (!res.ok) throw new Error(`Não baixou os dados: ${res.status}`);
  await writeFile(FILE, Buffer.from(await res.arrayBuffer()));
}
const geo = JSON.parse(await readFile(FILE, "utf8"));

const polygons = [];
for (const f of geo.features) {
  const g = f.geometry;
  if (g.type === "Polygon") polygons.push(g.coordinates);
  else if (g.type === "MultiPolygon") polygons.push(...g.coordinates);
}

// Ponto em polígono (par-ímpar, anel externo e buracos juntos).
function inside(lon, lat, rings) {
  let c = false;
  for (const ring of rings) {
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const [xi, yi] = ring[i];
      const [xj, yj] = ring[j];
      if (yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) c = !c;
    }
  }
  return c;
}

const round = (n) => Math.round(n * 10) / 10;
const dots = [];
for (let lat = LAT_TOP; lat >= LAT_BOTTOM; lat -= STEP) {
  for (let lon = -180 + STEP / 2; lon < 180; lon += STEP) {
    if (polygons.some((p) => inside(lon, lat, p))) dots.push(`M${round((lon + 180) * SCALE)} ${round((LAT_TOP - lat) * SCALE)}h0`);
  }
}

const width = 360 * SCALE;
const height = (LAT_TOP - LAT_BOTTOM) * SCALE;
const src = `// GERADO por scripts/generate-world-map.mjs (npm run world-map). Não editar à mão.
// Dados: Natural Earth (ne_110m_land), domínio público, naturalearthdata.com. Pontos de uma grade de ${STEP}°, em terra.
// Projeção equiretangular: x = (lon + 180) * scale, y = (latTop - lat) * scale.
export const worldMap = {
  width: ${width},
  height: ${height},
  scale: ${SCALE},
  latTop: ${LAT_TOP},
  /** Um único caminho: cada ponto é um traço de comprimento zero (desenhado redondo com stroke-linecap). */
  dots: "${dots.join("")}",
} as const;

/** Posição (0 a 1) de uma coordenada dentro do mapa. */
export function project(lon: number, lat: number): { x: number; y: number } {
  return { x: ((lon + 180) * worldMap.scale) / worldMap.width, y: ((worldMap.latTop - lat) * worldMap.scale) / worldMap.height };
}
`;
await writeFile(OUT, src);
console.log(`lib/world-map.ts: ${dots.length} pontos, ${(src.length / 1024).toFixed(1)} KB`);
