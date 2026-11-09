import Image from "next/image";
import { orgLogos, type OrgLogoId } from "@/lib/org-logos";

type Props = {
  title: string;
  titleUrl?: string;
  /** Segunda linha: cargo ou descrição curta. */
  sub?: string;
  about?: string;
  lines?: string[];
  period: string;
  logo?: OrgLogoId;
};

/** Linha de duas pontas, igual em Experiência e Formação: texto à esquerda, período à direita. */
export function EntryRow({ title, titleUrl, sub, about, lines, period, logo }: Props) {
  const l = logo ? orgLogos[logo] : null;
  return (
    <li className="entry" data-reveal-part>
      <div className="entry-main">
        {l ? (
          <Image className={l.tight ? "entry-logo tight" : "entry-logo"} src={l.src} alt="" width={40} height={l.height} unoptimized />
        ) : (
          <span className="entry-logo-gap" aria-hidden="true" />
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
    </li>
  );
}
