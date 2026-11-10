import { worldMap } from "./world-map";

/** Recorte do mapa-múndi pra primeira tela (#29): as Américas e o Atlântico, com João Pessoa à direita do centro. Mesmos pontos e mesma projeção do `world-map.ts`. */
export const crop = { lonMin: -100, lonMax: 20, latTop: 48, latBottom: -42 } as const;

const { scale, latTop: mapLatTop } = worldMap;

/** `viewBox` do SVG que mostra só o recorte (as coordenadas são as do mapa inteiro; o que sobra fica cortado). */
export const cropViewBox = {
  x: (crop.lonMin + 180) * scale,
  y: (mapLatTop - crop.latTop) * scale,
  width: (crop.lonMax - crop.lonMin) * scale,
  height: (crop.latTop - crop.latBottom) * scale,
};

/** Posição (0 a 1) de uma coordenada dentro do recorte. */
export function projectInCrop(lon: number, lat: number): { x: number; y: number } {
  return { x: (lon - crop.lonMin) / (crop.lonMax - crop.lonMin), y: (crop.latTop - lat) / (crop.latTop - crop.latBottom) };
}
