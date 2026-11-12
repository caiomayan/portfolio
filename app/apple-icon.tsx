import { faviconImage } from "@/lib/favicon";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// O mesmo desenho do ícone da aba, em 180 px e com fundo opaco (o iOS pinta transparência de preto) (lib/favicon.tsx). Gerado no build.
export default function AppleIcon() {
  return faviconImage(size.width, { opaque: true });
}
