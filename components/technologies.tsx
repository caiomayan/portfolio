import type { Content } from "@/content";
import { StackIcons } from "./stack-icons";

/** Tecnologias que o Caio domina: só ícones lado a lado, com o mesmo tooltip da stack do Carmine. */
export function Technologies({ content }: { content: Content }) {
  const { heading, items } = content.technologies;
  return (
    <section id="tecnologias" aria-labelledby="tecnologias-title">
      <h2 id="tecnologias-title" data-reveal-part>{heading}</h2>
      <StackIcons items={items} data-reveal-part />
    </section>
  );
}
