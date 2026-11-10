import type { Content } from "@/content";
import type { Activity as ActivityData } from "@/lib/github-activity";
import { locales, type Lang } from "@/lib/locales";

/**
 * Gráfico de contribuições do último ano (#28), renderizado no servidor, em preto e branco: cada nível é um tom de `--ink`
 * sobre `--bg` (a cor da API é ignorada). Sem dado, o componente não existe. A grade é decorativa; o total está em texto.
 * No celular a grade rola dentro do próprio bloco (a página não rola de lado) e abre nas semanas mais recentes, sem JavaScript
 * (o truque do `direction: rtl` no contêiner está em app/dados.css).
 */
export function Activity({ content, data, lang }: { content: Content["activity"]; data: ActivityData | null; lang: Lang }) {
  if (!data) return null;
  const total = (data.total === 1 ? content.total.one : content.total.other).replace("{n}", data.total.toLocaleString(locales[lang].htmlLang));
  return (
    <section className="activity" aria-labelledby="atividade">
      <h2 id="atividade" data-reveal-part>
        {content.heading}
      </h2>
      <p className="activity-total" data-reveal-part>
        {total}
      </p>
      {/* Região rolável precisa de foco no teclado e de nome. */}
      <div className="activity-scroll" role="img" aria-label={total} tabIndex={0} data-reveal-part>
        <div className="activity-grid" aria-hidden="true">
          {data.weeks.map((week, i) => (
            <div className="activity-week" key={i}>
              {week.map((day, j) => (
                <span className="activity-day" data-level={day.level} key={j} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
