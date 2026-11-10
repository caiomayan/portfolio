/**
 * Clima atual de João Pessoa (Open-Meteo, CC BY 4.0, sem chave). Roda só no servidor, no render da página:
 * o navegador do visitante nunca chama a API. A resposta fica no cache de dados do Next (revalida a cada 30 min).
 * Qualquer falha (rede, status, formato, demora) vira `null` e o clima simplesmente não aparece.
 */

import { apiUrl } from "./api-url.ts";

export type WeatherKind = "clear" | "partly" | "cloudy" | "fog" | "rain" | "storm";
export type Weather = { temperature: number; kind: WeatherKind; isDay: boolean };

export type WeatherIcon = "sun" | "moon" | "cloud-sun" | "cloud-moon" | "cloud" | "cloud-fog" | "cloud-rain" | "cloud-moon-rain" | "cloud-lightning";

/** Ícone do tempo, na versão noturna quando não é dia (`is_day` do Open-Meteo): lua no céu limpo, nuvem com lua no parcialmente nublado e na chuva. */
export function weatherIcon(kind: WeatherKind, isDay: boolean): WeatherIcon {
  switch (kind) {
    case "clear": return isDay ? "sun" : "moon";
    case "partly": return isDay ? "cloud-sun" : "cloud-moon";
    case "rain": return isDay ? "cloud-rain" : "cloud-moon-rain";
    case "fog": return "cloud-fog";
    case "storm": return "cloud-lightning";
    default: return "cloud";
  }
}

export const WEATHER_REVALIDATE_SECONDS = 30 * 60;
const DEFAULT_URL = "https://api.open-meteo.com/v1/forecast";
const TIMEOUT_MS = 4000;

/** Código WMO do Open-Meteo → ícone. Neve não acontece em João Pessoa: cai em "nublado". */
export function weatherKind(code: number): WeatherKind {
  if (code === 0 || code === 1) return "clear";
  if (code === 2) return "partly";
  if (code === 45 || code === 48) return "fog";
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return "rain";
  if (code >= 95 && code <= 99) return "storm";
  return "cloudy";
}

export async function getWeather(): Promise<Weather | null> {
  try {
    const url = new URL(apiUrl(process.env.OPEN_METEO_URL, DEFAULT_URL));
    url.searchParams.set("latitude", "-7.12");
    url.searchParams.set("longitude", "-34.88");
    url.searchParams.set("current", "temperature_2m,weather_code,is_day");
    url.searchParams.set("timezone", "America/Fortaleza");
    const res = await fetch(url, { next: { revalidate: WEATHER_REVALIDATE_SECONDS }, signal: AbortSignal.timeout(TIMEOUT_MS) });
    if (!res.ok) return null;
    const current = ((await res.json()) as { current?: { temperature_2m?: unknown; weather_code?: unknown; is_day?: unknown } }).current;
    const t = current?.temperature_2m;
    const code = current?.weather_code;
    if (typeof t !== "number" || !Number.isFinite(t) || typeof code !== "number") return null;
    // Sem `is_day` válido, assume dia (o ícone do dia é o padrão).
    return { temperature: Math.round(t), kind: weatherKind(code), isDay: current?.is_day !== 0 };
  } catch {
    return null;
  }
}
