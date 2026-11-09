/** Tabela única de línguas: rota, valor do `lang` do <html>, hreflang e locale do Open Graph. Tudo que depende de rota ou língua sai daqui. */
export const locales = {
  pt: { path: "/", htmlLang: "pt-BR", hreflang: "pt-BR", ogLocale: "pt_BR" },
  en: { path: "/en", htmlLang: "en", hreflang: "en", ogLocale: "en_US" },
} as const;

export type Lang = keyof typeof locales;

/** Língua usada no hreflang "x-default". */
export const defaultLang: Lang = "pt";

/** Mapa hreflang → URL das duas rotas. `toUrl` troca a rota por outra forma (ex.: URL absoluta); sem ele, devolve a própria rota. */
export function languageAlternates(toUrl: (path: string) => string = (path) => path): Record<string, string> {
  return Object.fromEntries(Object.values(locales).map((l) => [l.hreflang, toUrl(l.path)]));
}
