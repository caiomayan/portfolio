import type { ReactNode } from "react";
import type { Content } from "@/content";

/**
 * Rodapé mínimo (#29): uma faixa discreta no fim da página, separada do Contato só por espaço (sem linha nem fundo).
 * À esquerda o © com o ano corrente (calculado ao gerar a página, sem número fixo no texto); à direita o crédito do Open-Meteo (CC BY 4.0),
 * que só existe quando há clima. No celular os dois empilham. Componente de servidor.
 */
export function SiteFooter({ footer, credit }: { footer: Content["footer"]; credit?: ReactNode }) {
  return (
    <footer className="site-footer">
      <p className="site-footer-copy">{footer.copyright.replace("{year}", String(new Date().getFullYear()))}</p>
      {credit}
    </footer>
  );
}
