import Image from "next/image";
import type { Content } from "@/content";
import foto from "@/assets/foto-original.jpg";
import { Signature } from "./signature";
import { ThemeToggle } from "./theme-toggle";
import { LangSwitch } from "./lang-switch";
import { Place } from "./place";
import type { WeatherSlots } from "./weather";

/** `weather`: clima já renderizado no servidor (#28), vai ao lado da hora; `null` quando a API falhou. */
export function Hero({ content, weather = null }: { content: Content; weather?: WeatherSlots | null }) {
  return (
    <>
      <header className="top">
        <Signature name={content.hero.name} />
        <div className="top-actions">
          <LangSwitch ui={content.ui} />
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
          <Place place={content.hero.place} weather={weather} />
        </div>
      </main>
    </>
  );
}
