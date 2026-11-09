import type { Metadata } from "next";
import { content, openingLine, type Lang } from "@/content";
import { defaultLang, languageAlternates, locales } from "@/lib/locales";
import { SITE_URL } from "@/lib/site";

export function pageMetadata(lang: Lang): Metadata {
  const page = content[lang];
  const description = openingLine(page);
  const url = locales[lang].path;
  return {
    metadataBase: new URL(SITE_URL),
    title: page.meta.title,
    description,
    // Canonical e hreflang entre as duas rotas (cada uma aponta pra si e pra outra); sem redirecionamento por língua do navegador.
    alternates: {
      canonical: url,
      languages: {
        ...languageAlternates(),
        "x-default": locales[defaultLang].path,
      },
    },
    // A imagem de prévia vem de opengraph-image.tsx / twitter-image.tsx da pasta de cada rota.
    openGraph: { type: "website", url, title: page.meta.title, description, siteName: page.hero.name, locale: locales[lang].ogLocale },
    twitter: { card: "summary_large_image", title: page.meta.title, description },
  };
}
