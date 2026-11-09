import { ImageResponse } from "next/og";
import { palette } from "@/lib/palette";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

// O ponto do título (cor do texto do tema claro), sobre o fundo do site. Gerado no build.
export default function Icon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: palette.bg }}>
        <div style={{ width: 14, height: 14, borderRadius: 7, background: palette.ink }} />
      </div>
    ),
    size,
  );
}
