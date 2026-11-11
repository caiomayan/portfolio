import type { Metadata } from "next";
import { content, openingLine, type Lang } from "@/content";
import { defaultLang, languageAlternates, locales } from "@/lib/locales";
import { ogAlt, ogPath, ogSize } from "@/lib/og-image";
import { SITE_URL } from "@/lib/site";

export function pageMetadata(lang: Lang): Metadata {
  const page = content[lang];
  const description = openingLine(page);
  const url = locales[lang].path;
  const image = { url: ogPath(lang), width: ogSize.width, height: ogSize.height, alt: ogAlt(lang) };
  return {
    metadataBase: new URL(SITE_URL),
    title: page.meta.title,
    description,
    // Canonical e hreflang entre as três rotas (cada uma aponta pra si e pras outras); sem redirecionamento por língua do navegador.
    alternates: {
      canonical: url,
      languages: {
        ...languageAlternates(),
        "x-default": locales[defaultLang].path,
      },
    },
    // A imagem de prévia de cada língua é gerada no build por app/og/[lang]/route.tsx.
    openGraph: { type: "website", url, title: page.meta.title, description, siteName: page.hero.name, locale: locales[lang].ogLocale, images: [image] },
    twitter: { card: "summary_large_image", title: page.meta.title, description, images: [image] },
  };
}
