import Image from "next/image";
import type { Content } from "@/content";
import foto from "@/assets/foto-original.jpg";
import { ThemeToggle } from "./theme-toggle";

export function Hero({ c }: { c: Content }) {
  return (
    <>
      <header className="top">
        <span aria-hidden="true" />
        <ThemeToggle label={c.ui.themeToggle} />
      </header>
      <main className="hero">
        <figure className="who">
          <Image
            className="photo"
            src={foto}
            alt={c.hero.photoAlt}
            sizes="(min-width: 900px) 360px, 160px"
            preload
          />
          <figcaption>
            <b>{c.hero.name}</b>
            <span>{c.hero.location}</span>
          </figcaption>
        </figure>
        <div className="intro">
          <h1>{c.hero.title}</h1>
          <p className="lead">{c.hero.lead}</p>
        </div>
      </main>
    </>
  );
}
