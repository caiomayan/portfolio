import { ImageResponse } from "next/og";
import { palette } from "./palette";

/**
 * Ícone da aba e da tela inicial (#46): um círculo com degradê vertical, do claro em cima ao escuro embaixo, sobre fundo transparente.
 * O contorno é cinza neutro e semitransparente (sem cor): o círculo claro lê na aba escura e o escuro lê na aba clara. O mesmo desenho
 * serve a `app/icon.tsx` (32 px, transparente) e `app/apple-icon.tsx` (180 px); o iOS preenche transparência com preto na tela inicial, então o apple-icon (e só ele)
 * leva fundo opaco `--bg` do tema claro, com o círculo dentro. O contorno e a margem crescem com o tamanho.
 */
export function faviconImage(px: number, opts: { opaque?: boolean } = {}) {
  // Com fundo opaco (apple-icon) o círculo ganha margem; o da aba ocupa quase tudo.
  const circle = opts.opaque ? Math.round(px * 0.72) : px - 2;
  const edge = Math.max(1, Math.round(px / 20));
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", ...(opts.opaque ? { background: palette.bg } : {}) }}>
        <div
          style={{
            width: circle,
            height: circle,
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
