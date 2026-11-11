import Image from "next/image";
import type { Content } from "@/content";
import foto from "@/assets/foto-original.jpg";
import { Signature } from "./signature";
import { ThemeToggle } from "./theme-toggle";
import type { Lang } from "@/lib/locales";
import { ContactIcons } from "./contact-icons";
import { LangMenu } from "./lang-menu";
import { Place } from "./place";
import { FloatingControls } from "./floating-controls";
import type { WeatherSlots } from "./weather";

/** Barra do topo: fica fora do <main>, como o rodapé. */
export function SiteHeader({ content, lang }: { content: Content; lang: Lang }) {
  return (
    <header className="top">
      <Signature name={content.hero.name} />
      <FloatingControls>
        <LangMenu lang={lang} label={content.ui.language} />
        <ThemeToggle label={content.ui.themeToggle} />
      </FloatingControls>
    </header>
  );
}

/** Primeira tela: uma seção do <main> (que envolve todas as seções, montado em cada página). */
/** `weather`: clima já renderizado no servidor (#28), na terceira linha do lugar; `null` quando a API falhou. */
export function Hero({ content, weather = null }: { content: Content; weather?: WeatherSlots | null }) {
  return (
    <section className="hero" aria-labelledby="hero-title">
      {/* Meio (#36): foto e título lado a lado, centrados entre o topo e a faixa de baixo. */}
      <div className="hero-main">
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
          <h1 id="hero-title">{content.hero.title}</h1>
          <p className="lead">{content.hero.lead}</p>
        </div>
      </div>
      {/* Faixa de baixo (#36): presa à base da primeira tela; lugar à esquerda e os ícones de contato à direita (#38). */}
      <div className="hero-strip">
        <Place place={content.hero.place} weather={weather} />
        <ContactIcons contact={content.contact} />
      </div>
    </section>
  );
}
