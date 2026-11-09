import { ImageResponse } from "next/og";
import { content, type Lang } from "@/content";

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";

// Mesmas cores do tema claro (app/globals.css). Satori não lê variáveis CSS, então ficam aqui.
const BG = "#fbfbfd";
const INK = "#1d1d1f";
const SOFT = "#6e6e73";
const ACCENT = "#d92b21";

/** Texto alternativo da imagem de prévia: o título da aba, que já está em content/. */
export function ogAlt(lang: Lang): string {
  return content[lang].meta.title;
}

/** Imagem de prévia (Open Graph e Twitter) de uma língua: nome, título e frase de abertura. Gerada no build. */
export function ogImage(lang: Lang): ImageResponse {
  const { hero } = content[lang];
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: BG,
          color: INK,
          padding: "80px 88px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", fontSize: 36, fontWeight: 600, color: SOFT }}>{hero.name}</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", whiteSpace: "nowrap", fontSize: 88, fontWeight: 700, letterSpacing: -4, lineHeight: 1.05 }}>
            {hero.title}
            <span style={{ color: ACCENT }}>.</span>
          </div>
          <div style={{ display: "flex", marginTop: 28, fontSize: 40, lineHeight: 1.35, color: SOFT }}>{hero.lead}</div>
        </div>
      </div>
    ),
    ogSize,
  );
}
