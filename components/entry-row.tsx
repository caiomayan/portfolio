import Image from "next/image";
import { orgLogos, type OrgLogoId } from "@/lib/org-logos";
import type { FallbackIconId } from "@/lib/fallback-icons";
import { FallbackIcon } from "./fallback-icon";

type Props = {
  title: string;
  titleUrl?: string;
  /** Segunda linha: cargo ou descrição curta. */
  sub?: string;
  about?: string;
  lines?: string[];
  /** Subitens subordinados à linha (ex.: a monitoria dentro do curso): recuados, menores, com o próprio período. */
  subitems?: { title: string; period: string }[];
  period: string;
  /** Logo OU ícone de reserva: um dos dois, sempre. */
  logo?: OrgLogoId;
  icon?: FallbackIconId;
};

/** Linha de duas pontas, igual em Experiência e Formação: texto à esquerda, período à direita. */
export function EntryRow({ title, titleUrl, sub, about, lines, subitems, period, logo, icon }: Props) {
  const l = logo ? orgLogos[logo] : null;
  return (
    <li className="entry" data-reveal-part>
      <div className="entry-main">
        {l ? (
          <Image className="entry-logo" data-colored={l.colored ? "" : undefined} src={l.src} alt="" width={40} height={l.height} unoptimized />
        ) : (
          <span className="entry-logo-gap">{icon && <FallbackIcon id={icon} />}</span>
        )}
        <div>
          <h3>{titleUrl ? <a href={titleUrl}>{title}</a> : title}</h3>
          {sub && <p className="entry-sub">{sub}</p>}
          {about && <p className="entry-sub">{about}</p>}
          {lines && (
            <ul className="entry-lines">
              {lines.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <span className="entry-period">{period}</span>
      {/* Irmão do texto e do período, na largura toda: o período do subitem alinha com o da linha, e o da linha não cai embaixo dele no celular. */}
      {subitems && (
        <ul className="entry-children">
          {subitems.map((s) => (
            <li key={s.title} className="entry-child">
              <span className="entry-child-title">{s.title}</span>
              <span className="entry-child-period">{s.period}</span>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}
