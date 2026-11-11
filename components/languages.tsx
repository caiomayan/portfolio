import { CornerDownRight } from "lucide-react";
import { PARALLAX_TITLE } from "@/lib/parallax";
import type { Content } from "@/content";

/**
 * Idiomas (#38): seção própria no fim da página, com o mesmo título das outras e sem bandeiras. Linhas de duas pontas
 * (nome à esquerda, nível à direita) e, quando há, um subnível embaixo no estilo da monitoria do curso (ícone de hierarquia, texto menor).
 * Lista o que o Caio fala: por isso não tem espanhol em nenhuma das três páginas. Componente de servidor.
 */
export function Languages({ languages }: { languages: Content["languages"] }) {
  return (
    <section id="idiomas" aria-labelledby="idiomas-title">
      <h2 id="idiomas-title" data-reveal-part data-parallax={PARALLAX_TITLE}>{languages.heading}</h2>
      <ul className="languages">
        {languages.items.map((item) => (
          <li key={item.name} className="language" data-reveal-part>
            <h3 className="language-name">{item.name}</h3>
            <span className="language-level">{item.level}</span>
            {item.sub && (
              <p className="language-sub">
                <CornerDownRight className="language-sub-icon" strokeWidth={1.75} aria-hidden="true" focusable="false" />
                {item.sub}
              </p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
