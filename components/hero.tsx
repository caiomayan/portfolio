import Image from "next/image";
import type { Content } from "@/content";
import foto from "@/assets/foto-original.jpg";
import { ThemeToggle } from "./theme-toggle";

export function Hero({ content }: { content: Content }) {
  return (
    <>
      <header className="top">
        <span aria-hidden="true" />
        <ThemeToggle label={content.ui.themeToggle} />
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
