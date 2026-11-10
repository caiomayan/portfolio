"use client";

import { useId, useRef, useState } from "react";
import Image from "next/image";
import { FallbackIcon } from "./fallback-icon";
import { stackLogos } from "@/lib/stack-logos";
import type { IconList } from "@/content/types";
import { Tooltip } from "./tooltip";

/**
 * Linha discreta de ícones de tecnologia com rótulo ("Feito com", "No curso"): ícones pequenos em --soft, sem texto na tela.
 * O nome de cada um é o tooltip e o nome acessível. Único componente dessa linha: Carmine, curso e TechEduConnect.
 * Os ícones não são controles: a linha inteira é UMA parada de Tab (roving tabindex) e as setas esquerda/direita
 * (mais Home e End) andam entre os ícones, mostrando o tooltip de quem recebe o foco.
 */
export function IconRow({ list, ...rest }: { list: IconList } & React.HTMLAttributes<HTMLDivElement>) {
  const labelId = useId();
  const [active, setActive] = useState(0);
  const icons = useRef<(HTMLSpanElement | null)[]>([]);
  const last = list.items.length - 1;

  function onKeyDown(e: React.KeyboardEvent<HTMLUListElement>) {
    const next = { ArrowRight: Math.min(active + 1, last), ArrowLeft: Math.max(active - 1, 0), Home: 0, End: last }[e.key];
    if (next === undefined) return;
    e.preventDefault();
    setActive(next);
    icons.current[next]?.focus();
  }

  return (
    <div className="icon-row" {...rest}>
      <p className="icon-row-label" id={labelId}>{list.label}</p>
      <ul className="stack" aria-labelledby={labelId} onKeyDown={onKeyDown}>
        {list.items.map((s, i) => (
          <li key={s.name}>
            <Tooltip label={s.name}>
              {/* Só o ícone ativo entra na ordem do Tab; o foco (teclado ou clique) abre o tooltip; o nome acessível é o do próprio ícone. */}
              <span
                ref={(el) => {
                  icons.current[i] = el;
                }}
                className="stack-icon"
                role="img"
                aria-label={s.name}
                tabIndex={i === active ? 0 : -1}
                onFocus={() => setActive(i)}
              >
                {s.logo ? (
                  <Image className={stackLogos[s.logo].colored ? "logo color" : "logo"} src={stackLogos[s.logo].src} alt="" width={16} height={16} unoptimized />
                ) : (
                  <span className="stack-logo-empty"><FallbackIcon id={s.icon!} /></span>
                )}
              </span>
            </Tooltip>
          </li>
        ))}
      </ul>
    </div>
  );
}
