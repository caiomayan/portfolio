/**
 * Clima atual de João Pessoa (Open-Meteo, CC BY 4.0, sem chave). Roda só no servidor, no render da página:
 * o navegador do visitante nunca chama a API. A resposta fica no cache de dados do Next (revalida a cada 30 min).
 * Qualquer falha (rede, status, formato, demora) vira `null` e o clima simplesmente não aparece.
 */

import { apiUrl } from "./api-url.ts";

export type WeatherKind = "clear" | "partly" | "cloudy" | "fog" | "rain" | "storm";
export type Weather = { temperature: number; kind: WeatherKind };

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
    url.searchParams.set("current", "temperature_2m,weather_code");
    url.searchParams.set("timezone", "America/Fortaleza");
    const res = await fetch(url, { next: { revalidate: WEATHER_REVALIDATE_SECONDS }, signal: AbortSignal.timeout(TIMEOUT_MS) });
    if (!res.ok) return null;
    const current = ((await res.json()) as { current?: { temperature_2m?: unknown; weather_code?: unknown } }).current;
    const t = current?.temperature_2m;
    const code = current?.weather_code;
    if (typeof t !== "number" || !Number.isFinite(t) || typeof code !== "number") return null;
    return { temperature: Math.round(t), kind: weatherKind(code) };
  } catch {
    return null;
  }
}
