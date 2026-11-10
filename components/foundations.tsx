import type { Content } from "@/content";

/** Fundamentos: o que ele sabe de base, em três grupos de texto (sem ícones; ferramentas aparecem só onde têm contexto). */
export function Foundations({ content }: { content: Content }) {
  const { heading, groups } = content.foundations;
  return (
    <section id="fundamentos" aria-labelledby="fundamentos-title">
      <h2 id="fundamentos-title" data-reveal-part>{heading}</h2>
      <div className="foundations">
        {groups.map((group) => (
          <div key={group.label} className="foundation-group" data-reveal-part>
            <h3>{group.label}</h3>
            <ul>
              {group.items.map((item) => (
                <li key={item.name}>
                  <span className="foundation-name">{item.name}</span>
                  {item.detail ? <span className="foundation-detail">{item.detail}</span> : null}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
