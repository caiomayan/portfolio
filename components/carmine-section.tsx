import Image from "next/image";
import type { Content } from "@/content";
import { CarmineShots } from "./carmine-shots";
import carmineLogo from "@/assets/logos/carmine.svg";
import { stackLogos } from "@/lib/stack-logos";

export function CarmineSection({ content }: { content: Content["carmine"] }) {
  return (
    <section id="carmine" aria-labelledby="carmine-title">
      <div className="carmine-aside" data-reveal-part>
        <h2 id="carmine-title">{content.heading}</h2>
        <p className="carmine-aside-note">{content.note}</p>
      </div>
      <div className="carmine-body">
        <p className="status" data-reveal-part><span className="status-dot" aria-hidden="true" />{content.status}</p>
        <div className="project-head" data-reveal-part>
          <Image src={carmineLogo} alt="" width={40} height={40} unoptimized />
          <span className="project-name">{content.name}</span>
        </div>
        <p data-reveal-part>{content.what}</p>
        <p className="soft" data-reveal-part>{content.how}</p>

        <CarmineShots content={content} />

        <h3 className="label" data-reveal-part>{content.stackLabel}</h3>
        <ul className="stack" data-reveal-part>
          {content.stack.map((s) => (
            <li key={s.name}>
              <span className="stack-name">
                {s.logo ? (
                  <Image className={stackLogos[s.logo].colored ? "logo color" : "logo"} src={stackLogos[s.logo].src} alt="" width={20} height={20} unoptimized />
                ) : (
                  <span className="stack-logo-empty" aria-hidden="true" />
                )}
                {s.name}
              </span>
              <span className="stack-role">{s.role}</span>
            </li>
          ))}
        </ul>

        <div className="links" data-reveal-part>
          <a className="link-external" href={content.links.site.href}>{content.links.site.label}</a>
          <a className="link-external" href={content.links.repo.href}>{content.links.repo.label}</a>
        </div>
      </div>
    </section>
  );
}
