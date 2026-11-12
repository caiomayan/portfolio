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
import { ScrollCue } from "./scroll-cue";
import type { WeatherSlots } from "./weather";

/**
 * Frase de abertura com o brilho (#39, rodada 4) só no trecho marcado em `content/` (`hero.leadShine`). O texto da página NÃO muda: o <p class="lead"> segue com a frase
 * inteira num texto só e **sem nenhum elemento dentro**. O brilho é uma camada decorativa **irmã** (`aria-hidden`, sem texto no DOM: o texto sai de `data-t` por CSS
 * `content`), com a mesma tipografia e por isso as mesmas linhas, por cima do <p>. Medido a 4× de CPU no celular: qualquer elemento filho dentro desse <p> (um <span>
 * em volta do trecho, até sem classe) fazia o LCP pular de ~0,4 s pra ~3,4 s em cerca de metade das cargas (o texto deixava de ser candidato). O trecho tem que
 * aparecer exatamente uma vez na frase; se não, a frase sai sem brilho (um teste cobre as três línguas).
 */
function Lead({ lead, shine }: { lead: string; shine: string }) {
  const i = lead.indexOf(shine);
  const ok = i >= 0 && lead.indexOf(shine, i + 1) < 0;
  return (
    <div className="lead-wrap">
      <p className="lead">{lead}</p>
      {ok && (
        <span className="lead-glare" aria-hidden="true">
          <span data-t={lead.slice(0, i)} />
          <span className="lead-shine" data-t={shine} />
          <span data-t={lead.slice(i + shine.length)} />
        </span>
      )}
    </div>
  );
}

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
          <Lead lead={content.hero.lead} shine={content.hero.leadShine} />
        </div>
      </div>
      {/* Faixa de baixo (#36): presa à base da primeira tela; lugar à esquerda e os ícones de contato à direita (#38). */}
      <div className="hero-strip">
        <Place place={content.hero.place} weather={weather} />
        <ContactIcons contact={content.contact} />
      </div>
      <ScrollCue />
    </section>
  );
}
