"use client";

import { useEffect, useRef } from "react";

/**
 * Indicador de rolagem (#39, rodada 4): fio fino com um ponto que desce devagar no fim da primeira tela (app/motion.css; só aparece em telas altas, onde sobra vão).
 * Some ao começar a rolar e volta ao topo. Um ouvinte passivo de `scroll` troca `data-hidden` direto no elemento (sem re-render e sem depender do GSAP, que só chega
 * depois da abertura). Decorativo: `aria-hidden`, sem texto.
 */
export function ScrollCue() {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      if (window.scrollY > 24) el.setAttribute("data-hidden", "");
      else el.removeAttribute("data-hidden");
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  return (
    <span className="scroll-cue" ref={ref} aria-hidden="true">
      <span className="scroll-cue-dot" />
    </span>
  );
}
