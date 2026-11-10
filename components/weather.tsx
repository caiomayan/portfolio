import { Cloud, CloudFog, CloudLightning, CloudRain, CloudSun, Sun, type LucideIcon } from "lucide-react";
import type { Content } from "@/content";
import type { Weather, WeatherKind } from "@/lib/weather";

// Ícones do Lucide (monocromáticos, na cor do texto), um por tipo de tempo.
const icons: Record<WeatherKind, LucideIcon> = { clear: Sun, partly: CloudSun, cloudy: Cloud, fog: CloudFog, rain: CloudRain, storm: CloudLightning };

/**
 * Clima de João Pessoa (#28), renderizado no servidor: `now` vai ao lado da hora e `credit` embaixo da cidade, na primeira tela (#29).
 * Sem dado (`null`), nada aparece. O ícone é decorativo; o nome do tempo vai só pra leitor de tela.
 */
export function weatherSlots(weather: Weather | null, w: Content["contact"]["weather"]) {
  if (!weather) return null;
  const Icon = icons[weather.kind];
  return {
    now: (
      <span className="place-weather">
        <Icon className="weather-icon" size={16} strokeWidth={1.75} aria-hidden="true" focusable="false" />
        <span className="sr-only">{w.labels[weather.kind]}, </span>
        {`${weather.temperature}°C`}
      </span>
    ),
    credit: (
      <p className="weather-credit">
        {w.credit.prefix}{" "}
        <a href={w.credit.href} target="_blank" rel="noopener noreferrer">
          {w.credit.name}
        </a>
      </p>
    ),
  };
}

export type WeatherSlots = NonNullable<ReturnType<typeof weatherSlots>>;
