"use client";

import { useEffect, useState, type ReactNode } from "react";

/**
 * Tooltip discreto, o mesmo da stack e do contato. Só mostra o nome (texto visual): o nome acessível fica
 * no próprio controle (`aria-label`), por isso o balão é `aria-hidden`. Abre no hover e no foco do teclado,
 * fecha com Esc (WCAG 1.4.13) e fica fora do layout enquanto fechado. `end`: alinha o balão à borda direita do controle
 * (último ícone da faixa, no canto da página), pra ele não passar da largura da tela.
 */
export function Tooltip({ label, end = false, children }: { label: string; end?: boolean; children: ReactNode }) {
  const [hover, setHover] = useState(false);
  const [focus, setFocus] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const open = (hover || focus) && !dismissed;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDismissed(true);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <span
      className="tip-host"
      onPointerEnter={(e) => e.pointerType !== "touch" && setHover(true)}
      onPointerLeave={() => {
        setHover(false);
        setDismissed(false);
      }}
      onFocus={() => setFocus(true)}
      onBlur={() => {
        setFocus(false);
        setDismissed(false);
      }}
    >
      {children}
      {open && (
        <span className={end ? "tip tip-end" : "tip"} aria-hidden="true">
          <span className="tip-bubble">{label}</span>
        </span>
      )}
    </span>
  );
}
