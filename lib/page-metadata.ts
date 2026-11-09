import type { Metadata } from "next";
import { content, openingLine, type Lang } from "@/content";

export function pageMetadata(lang: Lang): Metadata {
  const page = content[lang];
  return {
    title: page.meta.title,
    description: openingLine(page),
    // hreflang e canonical entram na tarefa de SEO (precisam da URL absoluta do site).
  };
}
