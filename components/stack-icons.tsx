import Image from "next/image";
import { FallbackIcon } from "./fallback-icon";
import { stackLogos } from "@/lib/stack-logos";
import type { FallbackIconId } from "@/lib/fallback-icons";
import type { StackLogoId } from "@/lib/stack-logos";
import { Tooltip } from "./tooltip";

type Item = { name: string; logo?: StackLogoId; icon?: FallbackIconId };

/** Fileira de ícones de tecnologia, sem texto: o nome aparece no tooltip e é o nome acessível. Usada na stack do Carmine e na seção Tecnologias. */
export function StackIcons({ items, ...rest }: { items: Item[] } & React.HTMLAttributes<HTMLUListElement>) {
  return (
    <ul className="stack" {...rest}>
      {items.map((s) => (
        <li key={s.name}>
          <Tooltip label={s.name}>
            {/* Foco pelo teclado abre o tooltip; o nome acessível é o do próprio controle. */}
            <span className="stack-icon" role="img" aria-label={s.name} tabIndex={0}>
              {s.logo ? (
                <Image className={stackLogos[s.logo].colored ? "logo color" : "logo"} src={stackLogos[s.logo].src} alt="" width={20} height={20} unoptimized />
              ) : (
                <span className="stack-logo-empty"><FallbackIcon id={s.icon!} /></span>
              )}
            </span>
          </Tooltip>
        </li>
      ))}
    </ul>
  );
}
