import type { Content } from "@/content";
import { EntryRow } from "./entry-row";
import { TitleMask } from "./title-mask";

export function Education({ content }: { content: Content }) {
  const { heading, items } = content.education;
  return (
    <section id="formacao" className="entries" aria-labelledby="formacao-title">
      <h2 id="formacao-title"><TitleMask>{heading}</TitleMask></h2>
      <div className="timeline-wrap">
        <span className="timeline" aria-hidden="true" />
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
      </div>
    </section>
  );
}
