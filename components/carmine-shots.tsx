"use client";

import Image, { type StaticImageData } from "next/image";
import { useRef, useState, type KeyboardEvent } from "react";
import inventario from "@/assets/carmine/inventario.png";
import ranking from "@/assets/carmine/ranking.png";
import type { Content } from "@/content";

const images: Record<Content["carmine"]["shots"][number]["id"], StaticImageData> = { inventario, ranking };

/** Abas (padrão WAI-ARIA, ativação automática): setas, Home e End trocam o print. */
export function CarmineShots({ content }: { content: Content["carmine"] }) {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const last = content.shots.length - 1;

  function onKeyDown(e: KeyboardEvent) {
    const next =
      e.key === "ArrowRight" ? (active === last ? 0 : active + 1)
      : e.key === "ArrowLeft" ? (active === 0 ? last : active - 1)
      : e.key === "Home" ? 0
      : e.key === "End" ? last
      : null;
    if (next === null) return;
    e.preventDefault();
    setActive(next);
    tabs.current[next]?.focus();
  }

  return (
    <figure className="shots" data-reveal-part>
      <div className="tabs" role="tablist" aria-label={content.shotsLabel} onKeyDown={onKeyDown}>
        {content.shots.map((s, i) => (
          <button
            key={s.id}
            ref={(el) => { tabs.current[i] = el; }}
            type="button"
            role="tab"
            id={`shot-tab-${s.id}`}
            aria-selected={i === active}
            aria-controls={`shot-panel-${s.id}`}
            tabIndex={i === active ? 0 : -1}
            onClick={() => setActive(i)}
          >
            {s.tab}
          </button>
        ))}
      </div>
      <div className="frames">
        {content.shots.map((s, i) => (
          // Todos os prints ficam empilhados e a troca é um fade; o inativo sai da árvore de acessibilidade na hora.
          <div
            key={s.id}
            className="frame"
            role="tabpanel"
            id={`shot-panel-${s.id}`}
            aria-labelledby={`shot-tab-${s.id}`}
            aria-hidden={i !== active}
            data-active={i === active}
            inert={i !== active}
          >
            <Image src={images[s.id]} alt={s.alt} sizes="(min-width: 900px) 640px, calc(100vw - 48px)" />
          </div>
        ))}
      </div>
      <figcaption>{content.shotsCaption}</figcaption>
    </figure>
  );
}
