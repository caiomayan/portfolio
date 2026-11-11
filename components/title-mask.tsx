import type { ReactNode } from "react";

/**
 * Título de seção com máscara estática (#39): o texto sobe de dentro de uma janela recortada (`overflow: clip` em app/globals.css), conduzido
 * pela rolagem em lib/choreography.ts (só `transform` no texto interno). A máscara não anima: é CSS parado. Sem JavaScript, ou com movimento
 * reduzido, o texto fica no lugar, visível. Componente de servidor (o texto vem de `content/`, em qualquer língua).
 */
export function TitleMask({ children }: { children: ReactNode }) {
  return (
    <span className="title-mask">
      <span className="title-text">{children}</span>
    </span>
  );
}
