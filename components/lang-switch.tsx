import type { Content } from "@/content";
import { locales } from "@/lib/locales";
import { LangFlag } from "./lang-flag";
import { Tooltip } from "./tooltip";

/**
 * Seletor de língua (#29): as duas bandeiras lado a lado, sempre na mesma ordem (português, inglês).
 * A da língua atual fica em destaque (cor cheia e uma marca sutil), com `aria-current="page"`, e não é link; a outra fica mais apagada
 * e é o link comum pra rota equivalente (sem script, sem escolha automática por língua do navegador). Nome acessível e `lang`: a língua
 * ("English" / "Português"); o tooltip mostra o país. Componente de servidor: as bandeiras não entram no JavaScript do cliente.
 */
export function LangSwitch({ ui }: { ui: Content["ui"] }) {
  const { currentLang: cur, otherLang: other } = ui;
  const current = (
    <Tooltip key={cur.lang} label={cur.country} below>
      <span className="lang-option" aria-current="page" lang={cur.lang}>
        <LangFlag code={cur.flag} />
        <span className="sr-only">{cur.label}</span>
      </span>
    </Tooltip>
  );
  const link = (
    <Tooltip key={other.lang} label={other.country} below>
      <a className="lang-option" href={other.href} lang={other.lang} hrefLang={locales[other.lang].hreflang} aria-label={other.label}>
        <LangFlag code={other.flag} />
      </a>
    </Tooltip>
  );
  return <div className="lang-switch">{cur.lang === "pt" ? [current, link] : [link, current]}</div>;
}
