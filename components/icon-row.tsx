import { useId } from "react";
import Image from "next/image";
import { FallbackIcon } from "./fallback-icon";
import { stackLogos } from "@/lib/stack-logos";
import type { IconList } from "@/content/types";
import { Tooltip } from "./tooltip";

/**
 * Linha discreta de ícones de tecnologia com rótulo ("Feito com", "No curso"): ícones pequenos em --soft, sem texto na tela.
 * O nome de cada um é o tooltip e o nome acessível. Único componente dessa linha: Carmine, curso e TechEduConnect.
 */
export function IconRow({ list, ...rest }: { list: IconList } & React.HTMLAttributes<HTMLDivElement>) {
  const labelId = useId();
  return (
    <div className="icon-row" {...rest}>
      <p className="icon-row-label" id={labelId}>{list.label}</p>
      <ul className="stack" aria-labelledby={labelId}>
        {list.items.map((s) => (
          <li key={s.name}>
            <Tooltip label={s.name}>
              {/* Foco pelo teclado abre o tooltip; o nome acessível é o do próprio controle. */}
              <span className="stack-icon" role="img" aria-label={s.name} tabIndex={0}>
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
