"use client";

import { useId } from "react";
import Image from "next/image";
import { FallbackIcon } from "./fallback-icon";
import { useRoving } from "@/lib/roving";
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
  const roving = useRoving(list.items.length);

  return (
    <div className="icon-row" {...rest}>
      <p className="icon-row-label" id={labelId}>{list.label}</p>
      <ul className="stack" aria-labelledby={labelId} onKeyDown={roving.onKeyDown}>
        {list.items.map((s, i) => (
          <li key={s.name}>
            <Tooltip label={s.name}>
              {/* Só o ícone ativo entra na ordem do Tab; o foco (teclado ou clique) abre o tooltip; o nome acessível é o do próprio ícone. */}
              <span
                ref={roving.register(i)}
                className="stack-icon"
                role="img"
                aria-label={s.name}
                tabIndex={roving.tabIndex(i)}
                onFocus={() => roving.focusItem(i)}
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
