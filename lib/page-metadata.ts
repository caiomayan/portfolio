import type { Metadata } from "next";
import { content, langs, openingLine, type Lang } from "@/content";

export function pageMetadata(lang: Lang): Metadata {
  const c = content[lang];
  return {
    title: c.meta.title,
    description: openingLine(c),
    alternates: {
      canonical: langs[lang].path,
      languages: { "pt-BR": langs.pt.path, en: langs.en.path },
    },
  };
}
