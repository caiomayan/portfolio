"use client";

import { useRef, useState, type KeyboardEvent } from "react";

/**
 * Roving tabindex de uma linha de ícones: só o item ativo entra na ordem do Tab e as setas esquerda/direita (mais Home e End)
 * andam entre os itens, passando o foco. Usado pela linha de ícones de tecnologia (components/icon-row.tsx) e pelos ícones de
 * contato da primeira tela (components/contact-icons.tsx).
 * Uso: `ref={register(i)}`, `tabIndex={tabIndex(i)}`, `onFocus={() => focusItem(i)}` em cada item e `onKeyDown` no contêiner.
 */
export function useRoving(count: number) {
  const [active, setActive] = useState(0);
  const items = useRef<(HTMLElement | null)[]>([]);
  const last = count - 1;

  function onKeyDown(e: KeyboardEvent) {
    const next = { ArrowRight: Math.min(active + 1, last), ArrowLeft: Math.max(active - 1, 0), Home: 0, End: last }[e.key];
    if (next === undefined) return;
    e.preventDefault();
    setActive(next);
    items.current[next]?.focus();
  }

  return {
    onKeyDown,
    register: (i: number) => (el: HTMLElement | null) => {
      items.current[i] = el;
    },
    tabIndex: (i: number) => (i === active ? 0 : -1),
    /** Chamado no foco de um item (teclado ou clique): ele passa a ser o ativo. */
    focusItem: setActive,
  };
}
