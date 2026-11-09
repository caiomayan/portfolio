import type { Metadata } from "next";
import { content, openingLine, type Lang } from "@/content";

export function pageMetadata(lang: Lang): Metadata {
  const c = content[lang];
  return {
    title: c.meta.title,
    description: openingLine(c),
    // hreflang e canonical entram na tarefa de SEO (precisam da URL absoluta do site).
  };
}
