import type { Content } from "@/content";
import { cropViewBox, projectInCrop } from "@/lib/map-crop";
import { worldMap } from "@/lib/world-map";
import { LocalTime } from "./local-time";
import type { WeatherSlots } from "./weather";

// João Pessoa (7,12° S, 34,88° O).
const CITY = { lon: -34.88, lat: -7.12 };

/**
 * Lugar na primeira tela (#29, no lugar da linha "João Pessoa, PB"): mapa de pontos compacto (recorte das Américas e do Atlântico,
 * mesmos dados do mapa da #24) com o pino pulsando em João Pessoa; ao lado, em três linhas empilhadas, a cidade, a hora local e o clima (#28, #38).
 * Componente de servidor: só a hora (`LocalTime`) vai pro cliente. O mapa é decorativo (`aria-hidden`); cidade e hora estão em texto.
 * `weather`: clima já renderizado no servidor; `null` quando a API falhou.
 */
export function Place({ place, weather }: { place: Content["hero"]["place"]; weather: WeatherSlots | null }) {
  const { x, y } = projectInCrop(CITY.lon, CITY.lat);
  const v = cropViewBox;
  return (
    <div className="place">
      <div className="place-art" aria-hidden="true" style={{ aspectRatio: `${v.width} / ${v.height}` }}>
        <svg viewBox={`${v.x} ${v.y} ${v.width} ${v.height}`} focusable="false">
          <path d={worldMap.dots} />
        </svg>
        <span className="place-pin" style={{ left: `${(x * 100).toFixed(2)}%`, top: `${(y * 100).toFixed(2)}%` }}>
          <span className="place-pulse" />
          <span className="place-dot" />
        </span>
      </div>
      {/* Três linhas (#38): cidade, hora e clima (ícone e temperatura); o mapa fica centrado na altura delas. */}
      <p className="place-line">
        <span className="place-city">{place.city}</span>
        <LocalTime />
        {weather?.now}
      </p>
    </div>
  );
}
