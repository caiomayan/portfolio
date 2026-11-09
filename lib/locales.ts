/** Tabela única de línguas: rota, valor do `lang` do <html> e hreflang. Tudo que depende de rota ou língua sai daqui. */
export const locales = {
  pt: { path: "/", htmlLang: "pt-BR", hreflang: "pt-BR" },
  en: { path: "/en", htmlLang: "en", hreflang: "en" },
} as const;

export type Lang = keyof typeof locales;

/** Língua usada no hreflang "x-default". */
export const defaultLang: Lang = "pt";
