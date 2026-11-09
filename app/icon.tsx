import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

// O ponto de acento do título (var(--accent) do tema claro), sobre o fundo do site. Gerado no build.
export default function Icon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#fbfbfd" }}>
        <div style={{ width: 14, height: 14, borderRadius: 7, background: "#d92b21" }} />
      </div>
    ),
    size,
  );
}
