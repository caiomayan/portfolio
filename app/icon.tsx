import { faviconImage } from "@/lib/favicon";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

// Círculo com degradê, fundo transparente (lib/favicon.tsx). Gerado no build.
export default function Icon() {
  return faviconImage(size.width);
}
