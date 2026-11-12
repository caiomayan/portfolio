// Idioma automático na primeira visita (#46). Funções puras (sem Next nem DOM): o proxy (proxy.ts) e o seletor de idioma só as chamam.
import { langs, type Lang } from "./locales.ts";

/** Cookie com a escolha manual do seletor. Vale 1 ano; o proxy lê, o seletor grava. */
export const LANG_COOKIE = "lang";

/** Robôs e prévias de link: ficam sempre em `/`, pro Google indexar as três versões e as prévias não mudarem de língua. */
const BOT = /bot\b|bot[/;_ -]|crawl|spider|slurp|mediapartners|facebookexternalhit|facebot|embedly|quora link preview|whatsapp|telegram|skype|lighthouse|pagespeed|gtmetrix|pingdom|uptime|curl\/|wget\/|python-requests|go-http-client|node-fetch|axios\//i;

export const isBot = (userAgent: string | null | undefined): boolean => !!userAgent && BOT.test(userAgent);

const isLang = (value: string | null | undefined): value is Lang => !!value && (langs as string[]).includes(value);

/** Primeira língua suportada de um `Accept-Language`, respeitando o `q` (empate: a ordem da lista). `undefined` se o header não traz língua nenhuma; `null` se traz mas nenhuma é suportada. */
function fromAcceptLanguage(header: string): Lang | null | undefined {
  const ranges = header
    .split(",")
    .map((part, index) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params.map((p) => /^\s*q\s*=\s*([0-9.]+)\s*$/i.exec(p)?.[1]).find((v) => v !== undefined);
      return { primary: tag.trim().toLowerCase().split("-")[0], q: q === undefined ? 1 : Number(q), index };
    })
    .filter((r) => r.primary && r.primary !== "*" && Number.isFinite(r.q) && r.q > 0)
    .sort((a, b) => b.q - a.q || a.index - b.index);
  if (!ranges.length) return undefined;
  return ranges.map((r) => r.primary).find(isLang) ?? null;
}

/**
 * Língua em que `GET /` deve abrir. Ordem das regras (spec #46):
 * 1. escolha salva no cookie vence tudo;
 * 2. sem `Accept-Language` (ou sem língua nele), ou robô conhecido: `pt`, a própria `/`;
 * 3. a primeira língua suportada da lista, respeitando o `q`;
 * 4. nenhuma suportada: `en`.
 * Quem recebe `pt` não é redirecionado. Não usa IP.
 */
export function chooseLang({ acceptLanguage, cookie, userAgent }: { acceptLanguage?: string | null; cookie?: string | null; userAgent?: string | null }): Lang {
  if (isLang(cookie)) return cookie;
  if (!acceptLanguage || isBot(userAgent)) return "pt";
  const found = fromAcceptLanguage(acceptLanguage);
  if (found === undefined) return "pt";
  return found ?? "en";
}

/** Valor do cookie da escolha (1 ano, `SameSite=Lax`, `Secure`), no formato de `document.cookie`. */
export const langCookie = (lang: Lang): string => `${LANG_COOKIE}=${lang}; Max-Age=31536000; Path=/; SameSite=Lax; Secure`;

/** Grava a escolha manual (menu e cápsula). Sem acesso a cookies, a escolha só não fica salva. */
export function saveLangChoice(lang: Lang): void {
  try {
    document.cookie = langCookie(lang);
  } catch {
    /* cookies bloqueados: a troca de idioma segue funcionando */
  }
}
