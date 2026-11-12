import { ImageResponse } from "next/og";
import { palette } from "./palette";

/**
 * Ícone da aba e da tela inicial (#46): um círculo com degradê vertical, do claro em cima ao escuro embaixo, sobre fundo transparente.
 * O contorno é cinza neutro e semitransparente (sem cor): o círculo claro lê na aba escura e o escuro lê na aba clara. O mesmo desenho
 * serve a `app/icon.tsx` (32 px) e `app/apple-icon.tsx` (180 px); o contorno e a margem crescem com o tamanho.
 */
export function faviconImage(px: number) {
  const edge = Math.max(1, Math.round(px / 20));
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div
          style={{
            width: px - 2,
            height: px - 2,
            borderRadius: "50%",
            background: `linear-gradient(180deg, ${palette.bg} 0%, ${palette.ink} 100%)`,
            border: `${edge}px solid rgba(128, 128, 128, 0.45)`,
            boxSizing: "border-box",
          }}
        />
      </div>
    ),
    { width: px, height: px },
  );
}
