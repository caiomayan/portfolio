import Image from "next/image";
import type { Content } from "@/content";
import { CarmineShots } from "./carmine-shots";
import carmineLogo from "@/assets/logos/carmine.svg";
import nestjs from "@/assets/logos/nestjs.svg";
import nextdotjs from "@/assets/logos/nextdotjs.svg";
import valkey from "@/assets/logos/valkey.svg";
import amazonec2 from "@/assets/logos/amazonec2.svg";
import oracle from "@/assets/logos/oracle.svg";

const logos = { nestjs, nextdotjs, valkey, amazonec2, oracle };
/** Logos coloridas ficam como estão; as de uma cor só invertem no tema escuro. */
const colored = new Set(["valkey"]);

export function CarmineSection({ content }: { content: Content["carmine"] }) {
  return (
    <section id="carmine" className="section" aria-labelledby="carmine-title">
      <div className="rail">
        <h2 id="carmine-title">{content.heading}</h2>
        <p className="railnote">{content.note}</p>
      </div>
      <div className="col">
        <p className="status"><i aria-hidden="true" />{content.status}</p>
        <div className="proj-head">
          <Image src={carmineLogo} alt="" width={40} height={40} unoptimized />
          <b>{content.name}</b>
        </div>
        <p>{content.what}</p>
        <p className="soft">{content.how}</p>

        <CarmineShots content={content} />

        <h3 className="label">{content.stackLabel}</h3>
        <ul className="stack">
          {content.stack.map((s) => (
            <li key={s.name}>
              <span className="l">
                {s.logo ? (
                  <Image className={colored.has(s.logo) ? "logo color" : "logo"} src={logos[s.logo]} alt="" width={20} height={20} unoptimized />
                ) : (
                  <span className="noicon" aria-hidden="true" />
                )}
                {s.name}
              </span>
              <span className="v">{s.role}</span>
            </li>
          ))}
        </ul>

        <div className="links">
          <a className="ul" href={content.links.site.href}>{content.links.site.label} ↗</a>
          <a className="ul" href={content.links.repo.href}>{content.links.repo.label} ↗</a>
        </div>
      </div>
    </section>
  );
}
