import type { Metadata } from "next";
import { content, openingLine, type Lang } from "@/content";

/** Endereço público do site: só serve pra montar URLs absolutas (hreflang). */
const SITE = "https://caiomayan.com";

const paths: Record<Lang, string> = { pt: "/", en: "/en" };

export function pageMetadata(lang: Lang): Metadata {
  const page = content[lang];
  return {
    metadataBase: new URL(SITE),
    title: page.meta.title,
    description: openingLine(page),
    // hreflang entre as duas rotas (cada uma aponta pra si e pra outra); sem redirecionamento por língua do navegador.
    alternates: {
      languages: { "pt-BR": paths.pt, en: paths.en, "x-default": paths.pt },
    },
  };
}
