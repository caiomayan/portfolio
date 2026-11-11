/** Tabela única de línguas: rota, valor do `lang` do <html>, hreflang e locale do Open Graph. Tudo que depende de rota ou língua sai daqui. */
export const locales = {
  pt: { path: "/", segment: "", htmlLang: "pt-BR", hreflang: "pt-BR", ogLocale: "pt_BR", name: "Português", short: "PT" },
  en: { path: "/en", segment: "en", htmlLang: "en", hreflang: "en", ogLocale: "en_US", name: "English", short: "EN" },
  es: { path: "/es", segment: "es", htmlLang: "es", hreflang: "es", ogLocale: "es_ES", name: "Español", short: "ES" },
} as const;

export type Lang = keyof typeof locales;

/** Ordem em que as línguas aparecem no menu do seletor e nos parâmetros estáticos. */
export const langs = Object.keys(locales) as Lang[];

/** Língua usada no hreflang "x-default". */
export const defaultLang: Lang = "pt";

/** Língua de uma rota: o parâmetro `[[...lang]]` do Next (vazio na raiz). `undefined` quando a rota não existe. */
export function langFromParams(segments: string[] | undefined): Lang | undefined {
  const segment = segments?.[0] ?? "";
  if ((segments?.length ?? 0) > 1) return undefined;
  return langs.find((l) => locales[l].segment === segment);
}

/** Parâmetros estáticos de `[[...lang]]`: uma entrada por língua (a raiz é a lista vazia). */
export function langStaticParams(): { lang: string[] }[] {
  return langs.map((l) => ({ lang: locales[l].segment ? [locales[l].segment] : [] }));
}

/** Mapa hreflang → URL das rotas. `toUrl` troca a rota por outra forma (ex.: URL absoluta); sem ele, devolve a própria rota. */
export function languageAlternates(toUrl: (path: string) => string = (path) => path): Record<string, string> {
  return Object.fromEntries(Object.values(locales).map((l) => [l.hreflang, toUrl(l.path)]));
}
