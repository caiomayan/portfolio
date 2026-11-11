"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { prefersReducedMotion } from "@/lib/motion";

/** Quanto do topo da barra ainda conta como "no topo": os controles (a ~83 px da borda) já saíram da tela quando a barra passa daqui. */
const TOP_MARGIN = 80;

/**
 * Cápsula dos controles (#41): idioma e tema ficam na barra do topo e, quando o topo sai da tela, passam a uma cápsula fixa no canto
 * superior direito. É o mesmo elemento (uma cópia só no DOM, mesma ordem do Tab); só muda o posicionamento (`data-floating` em app/globals.css).
 * A entrada e a saída são animações de `transform` e `opacity` (app/motion.css), `data-motion="enter" | "exit"`; com movimento reduzido não há animação.
 * A troca de idioma recria a barra do topo: o estado inicial vem da rolagem de agora, sem animar, e a cápsula não "volta" ao topo.
 */
export function FloatingControls({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const [floating, setFloating] = useState(false);
  const [motion, setMotion] = useState<"enter" | "exit" | null>(null);

  useEffect(() => {
    const header = root.current?.closest("header");
    if (!header) return;
    let first = true;
    const io = new IntersectionObserver(
      ([entry]) => {
        const away = !entry.isIntersecting && entry.boundingClientRect.bottom < TOP_MARGIN;
        const animate = !first && !prefersReducedMotion();
        first = false;
        setFloating(away);
        setMotion(animate ? (away ? "enter" : "exit") : null);
      },
      { rootMargin: `-${TOP_MARGIN}px 0px 0px 0px` },
    );
    io.observe(header);
    return () => io.disconnect();
  }, []);

  // Na saída, a cápsula fica fixa até a animação acabar (e há um limite, caso ela não rode).
  const leaving = !floating && motion === "exit";
  useEffect(() => {
    if (!leaving) return;
    const t = setTimeout(() => setMotion(null), 400);
    return () => clearTimeout(t);
  }, [leaving]);

  return (
    <div
      ref={root}
      className="top-actions"
      data-floating={floating || leaving ? "true" : undefined}
      data-motion={motion ?? undefined}
      onAnimationEnd={(e) => {
        if (e.target === e.currentTarget && motion === "exit") setMotion(null);
      }}
    >
      {children}
    </div>
  );
}
