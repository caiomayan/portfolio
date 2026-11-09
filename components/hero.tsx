import Image from "next/image";
import type { Content } from "@/content";
import { locales } from "@/lib/locales";
import foto from "@/assets/foto-original.jpg";
import { ThemeToggle } from "./theme-toggle";

export function Hero({ content }: { content: Content }) {
  return (
    <>
      <header className="top">
        <span aria-hidden="true" />
        <div className="top-actions">
          {/* Link comum, sem script: leva à rota equivalente; nenhuma escolha automática por língua do navegador. */}
          <a className="lang-switch" href={content.ui.otherLang.href} lang={content.ui.otherLang.lang} hrefLang={locales[content.ui.otherLang.lang].hreflang}>
            {content.ui.otherLang.label}
          </a>
          <ThemeToggle label={content.ui.themeToggle} />
        </div>
      </header>
      <main className="hero">
        <figure className="who">
          <Image
            className="photo"
            src={foto}
            alt={content.hero.photoAlt}
            sizes="(min-width: 900px) 360px, 160px"
            preload
          />
          <figcaption>
            <b>{content.hero.name}</b>
            <span>{content.hero.location}</span>
          </figcaption>
        </figure>
        <div className="intro">
          <h1>{content.hero.title}</h1>
          <p className="lead">{content.hero.lead}</p>
        </div>
      </main>
    </>
  );
}
