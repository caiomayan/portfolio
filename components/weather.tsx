import { Cloud, CloudFog, CloudLightning, CloudMoon, CloudMoonRain, CloudRain, CloudSun, Moon, Sun, type LucideIcon } from "lucide-react";
import type { Content } from "@/content";
import { weatherIcon, type Weather, type WeatherIcon } from "@/lib/weather";

// Ícones do Lucide (monocromáticos, na cor do texto), um por tipo de tempo, com a versão noturna (lib/weather.ts, `weatherIcon`).
const icons: Record<WeatherIcon, LucideIcon> = {
  sun: Sun,
  moon: Moon,
  "cloud-sun": CloudSun,
  "cloud-moon": CloudMoon,
  cloud: Cloud,
  "cloud-fog": CloudFog,
  "cloud-rain": CloudRain,
  "cloud-moon-rain": CloudMoonRain,
  "cloud-lightning": CloudLightning,
};

/**
 * Clima de João Pessoa (#28), renderizado no servidor: `now` é a terceira linha do lugar, na primeira tela (#29, #38).
 * Crédito do Open-Meteo (CC BY 4.0, #39 rodada 5): a temperatura é um link discreto para open-meteo.com, ao lado de onde o dado aparece (sai do rodapé).
 * Sem dado (`null`), nada aparece. O ícone é decorativo; o nome do tempo vai só pra leitor de tela.
 */
export function weatherSlots(weather: Weather | null, w: Content["weather"]) {
  if (!weather) return null;
  const Icon = icons[weatherIcon(weather.kind, weather.isDay)];
  const temperature = `${weather.temperature}°C`;
  return {
    now: (
      <span className="place-weather">
        <Icon className="weather-icon" size={16} strokeWidth={1.75} aria-hidden="true" focusable="false" />
        <span className="sr-only">{w.labels[weather.kind]}, </span>
        <a className="weather-credit" href={w.credit.href} target="_blank" rel="noopener noreferrer" title={w.credit.label} aria-label={`${temperature}. ${w.credit.label}`}>
          {temperature}
        </a>
      </span>
    ),
  };
}

export type WeatherSlots = NonNullable<ReturnType<typeof weatherSlots>>;
