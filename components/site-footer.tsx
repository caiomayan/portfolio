import type { Content } from "@/content";

/**
 * Rodapé mínimo (#29): uma faixa discreta no fim da página, separada do Contato só por espaço (sem linha nem fundo), com o © e o ano corrente
 * (calculado ao gerar a página, sem número fixo no texto). O crédito do Open-Meteo saiu daqui (#39, rodada 5): é o link da temperatura na primeira tela. Componente de servidor.
 */
export function SiteFooter({ footer }: { footer: Content["footer"] }) {
  return (
    <footer className="site-footer">
      <p className="site-footer-copy">{footer.copyright.replace("{year}", String(new Date().getFullYear()))}</p>
    </footer>
  );
}
