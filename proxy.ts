import { NextResponse, type NextRequest } from "next/server";
import { chooseLang, LANG_COOKIE } from "@/lib/language-choice";
import { locales } from "@/lib/locales";

/**
 * Idioma automático na primeira visita (#46). Roda só em `GET /` (o `matcher` abaixo): `/en`, `/es`, os assets, a OG e os ícones nem passam por aqui.
 * A escolha (cookie, `Accept-Language`, robôs) está em `lib/language-choice.ts`; aqui só se redireciona.
 * Quem fica em `/` segue direto pro HTML estático (sem reescrita, sem cabeçalho novo). O redirect é 307 (não vira permanente em cache) e privado,
 * porque a resposta depende de cookie e de `Accept-Language`: nenhuma CDN pode servir o redirect de uma pessoa pra outra.
 */
export function proxy(request: NextRequest) {
  const lang = chooseLang({
    acceptLanguage: request.headers.get("accept-language"),
    cookie: request.cookies.get(LANG_COOKIE)?.value,
    userAgent: request.headers.get("user-agent"),
  });
  if (lang === "pt") return NextResponse.next();
  const response = NextResponse.redirect(new URL(locales[lang].path, request.url), 307);
  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("Vary", "Accept-Language, Cookie, User-Agent");
  return response;
}

export const config = { matcher: "/" };
