import type { Content } from "@/content";

/** Fundamentos: o que ele sabe de base, em linhas de texto (sem ícones; ferramentas aparecem só onde têm contexto). */
export function Foundations({ content }: { content: Content }) {
  const { heading, items } = content.foundations;
  return (
    <section id="fundamentos" aria-labelledby="fundamentos-title">
      <h2 id="fundamentos-title" data-reveal-part>{heading}</h2>
      <ul className="foundations">
        {items.map((item) => (
          <li key={item} data-reveal-part>{item}</li>
        ))}
      </ul>
    </section>
  );
}
