import type { Metadata } from "next";
import { content, openingLine, type Lang } from "@/content";
import { defaultLang, locales } from "@/lib/locales";
import { SITE_URL } from "@/lib/site";

export function pageMetadata(lang: Lang): Metadata {
  const page = content[lang];
  return {
    metadataBase: new URL(SITE_URL),
    title: page.meta.title,
    description: openingLine(page),
    // hreflang entre as duas rotas (cada uma aponta pra si e pra outra); sem redirecionamento por língua do navegador.
    alternates: {
      languages: {
        [locales.pt.hreflang]: locales.pt.path,
        [locales.en.hreflang]: locales.en.path,
        "x-default": locales[defaultLang].path,
      },
    },
  };
}
