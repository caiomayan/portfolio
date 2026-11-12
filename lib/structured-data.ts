import foto from "@/assets/foto-original.jpg";
import { content, type Lang } from "@/content";
import { locales } from "./locales";
import { absoluteUrl } from "./site";

export { jsonLdText } from "./structured-data-text.ts";

/**
 * JSON-LD `Person` de uma língua (#46), montado só com o que já é público em `content/`: nome, cargo, a URL da própria versão, a foto e os perfis
 * (LinkedIn e GitHub, em `sameAs`). Sem empregador, instituição nem contato pessoal.
 */
export function personJsonLd(lang: Lang) {
  const { hero, contact } = content[lang];
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: hero.name,
    jobTitle: hero.title,
    description: hero.lead,
    url: absoluteUrl(locales[lang].path),
    image: absoluteUrl(foto.src),
    sameAs: [contact.linkedin.href, contact.github.href],
  };
}
