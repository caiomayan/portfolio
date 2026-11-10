import Image from "next/image";
import type { Content } from "@/content";
import { locales } from "@/lib/locales";
import foto from "@/assets/foto-original.jpg";
import { Signature } from "./signature";
import { Tooltip } from "./tooltip";
import { ThemeToggle } from "./theme-toggle";
import { LangFlag } from "./lang-flag";

export function Hero({ content }: { content: Content }) {
  return (
    <>
      <header className="top">
        <Signature name={content.hero.name} />
        <div className="top-actions">
          {/* Link comum, sem script: leva à rota equivalente; nenhuma escolha automática por língua do navegador. */}
          {/* Só a bandeira (#24): o nome acessível e o `lang` são a língua; o tooltip mostra o país. */}
          <Tooltip label={content.ui.otherLang.country} below>
            <a
              className="lang-switch"
              href={content.ui.otherLang.href}
              lang={content.ui.otherLang.lang}
              hrefLang={locales[content.ui.otherLang.lang].hreflang}
              aria-label={content.ui.otherLang.label}
            >
              <LangFlag code={content.ui.otherLang.flag} />
            </a>
          </Tooltip>
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
        </figure>
        <div className="intro">
          <h1>{content.hero.title}</h1>
          <p className="lead">{content.hero.lead}</p>
          <p className="place">{content.hero.location}</p>
        </div>
      </main>
    </>
  );
}
