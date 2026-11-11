import type { Content } from "@/content";
import { PARALLAX_TITLE } from "@/lib/parallax";
import { EntryRow } from "./entry-row";

export function Education({ content }: { content: Content }) {
  const { heading, items } = content.education;
  return (
    <section id="formacao" className="entries" aria-labelledby="formacao-title">
      <h2 id="formacao-title" data-reveal-part data-parallax={PARALLAX_TITLE}>{heading}</h2>
      <ul>
        {items.map((item) => (
          <EntryRow
            key={item.title}
            title={item.title}
            sub={item.detail}
            about={item.description}
            subitems={item.children}
            stack={item.stack}
            period={item.period}
            logo={item.logo}
            icon={item.icon}
          />
        ))}
      </ul>
    </section>
  );
}
