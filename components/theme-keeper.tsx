"use client";

import { useLayoutEffect } from "react";

/**
 * Mantém o tema escuro salvo depois da troca de idioma (#38). A troca recria o layout raiz sem recarregar a página, e o React
 * reaplica os atributos do <html> que conhece (`lang`, `class`), apagando o `data-theme` que o script inline pôs antes da primeira pintura.
 * Efeito de layout: roda antes da pintura seguinte, então não pisca. No carregamento normal não muda nada (o script inline já aplicou).
 */
export function ThemeKeeper() {
  useLayoutEffect(() => {
    try {
      if (localStorage.getItem("theme") === "dark") document.documentElement.dataset.theme = "dark";
    } catch {}
  }, []);
  return null;
}
