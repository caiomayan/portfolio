import type { Content } from "@/content";
import { LangFlag } from "./lang-flag";

/** Línguas no Contato: rótulo e duas linhas de duas pontas (bandeira e nome à esquerda, nível à direita). Componente de servidor: as bandeiras não entram no JavaScript do cliente. */
export function ContactLanguages({ languages }: { languages: Content["contact"]["languages"] }) {
  return (
    <div className="contact-languages" data-reveal-part>
      <h3 id="idiomas">{languages.heading}</h3>
      <ul aria-labelledby="idiomas">
        {languages.items.map((l) => (
          <li key={l.name}>
            <span className="contact-language-name">
              <LangFlag code={l.flag} className="contact-language-flag" />
              {l.name}
            </span>
            <span className="contact-language-level">{l.level}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
