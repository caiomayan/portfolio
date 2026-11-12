// Issue #46: a função que escolhe a língua da primeira visita. Roda com o test runner do Node (npm run test:idioma), sem navegador.
import assert from "node:assert/strict";
import { test } from "node:test";
import { chooseLang, isBot, langCookie, LANG_COOKIE } from "../../lib/language-choice.ts";

const escolha = (acceptLanguage: string | null, cookie?: string | null, userAgent?: string | null) => chooseLang({ acceptLanguage, cookie, userAgent });

test("português na frente (ou sozinho) fica em /", () => {
  assert.equal(escolha("pt-BR,pt;q=0.9,en;q=0.8"), "pt");
  assert.equal(escolha("pt"), "pt");
});

test("inglês e espanhol, com região, vão pra /en e /es", () => {
  assert.equal(escolha("en-US"), "en");
  assert.equal(escolha("es-MX"), "es");
  assert.equal(escolha("EN-gb,en;q=0.8"), "en");
});

test("nenhuma língua suportada vai pra /en", () => {
  assert.equal(escolha("fr-FR,fr"), "en");
  assert.equal(escolha("ja,de;q=0.7"), "en");
});

test("pula as línguas sem suporte até achar a primeira suportada", () => {
  assert.equal(escolha("fr,es;q=0.5"), "es");
});

test("respeita o q, não só a ordem; q=0 não conta", () => {
  assert.equal(escolha("en;q=0.5,es;q=0.9"), "es");
  assert.equal(escolha("pt;q=0,en;q=0.4"), "en");
  assert.equal(escolha("en;q=0.8,pt;q=0.8"), "en"); // empate: vale a ordem da lista
});

test("sem Accept-Language, vazio ou ilegível: fica em /", () => {
  assert.equal(escolha(null), "pt");
  assert.equal(escolha(""), "pt");
  assert.equal(escolha("   "), "pt");
  assert.equal(escolha(";;;,,"), "pt");
});

test("curinga (*) não escolhe língua", () => {
  assert.equal(escolha("*"), "pt");
  assert.equal(escolha("*,es;q=0.5"), "es");
});

test("a escolha salva vence a detecção", () => {
  assert.equal(escolha("en-US", "pt"), "pt");
  assert.equal(escolha("pt-BR", "es"), "es");
  assert.equal(escolha(null, "en"), "en");
  assert.equal(escolha("fr", "pt"), "pt");
});

test("cookie com valor desconhecido é ignorado", () => {
  assert.equal(escolha("en-US", "xx"), "en");
  assert.equal(escolha("en-US", ""), "en");
});

test("robôs conhecidos ficam em /, mesmo com Accept-Language", () => {
  assert.equal(escolha("en-US", null, "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"), "pt");
  assert.equal(escolha("en-US", null, "Mozilla/5.0 (compatible; bingbot/2.0)"), "pt");
  assert.equal(escolha("en-US", null, "facebookexternalhit/1.1"), "pt");
  assert.equal(escolha("en-US", null, "Mozilla/5.0 (Linux; Android 11) Chrome-Lighthouse"), "pt");
});

test("navegador comum, inclusive o headless dos testes, não é robô", () => {
  assert.equal(isBot("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/140.0.0.0 Safari/537.36"), false);
  assert.equal(isBot("Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1"), false);
  assert.equal(isBot(null), false);
});

test("o cookie da escolha: nome, validade de 1 ano, SameSite=Lax e Secure", () => {
  assert.equal(LANG_COOKIE, "lang");
  const c = langCookie("en");
  assert.match(c, /^lang=en;/);
  assert.match(c, /Max-Age=31536000/);
  assert.match(c, /Path=\//);
  assert.match(c, /SameSite=Lax/);
  assert.match(c, /Secure/);
});
