"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { prefersReducedMotion } from "@/lib/motion";

/** Quanto do topo da barra ainda conta como "no topo": os controles (a ~83 px da borda) já saíram da tela quando a barra passa daqui. */
const TOP_MARGIN = 80;

/** Onde a folha existe (o mesmo recorte de app/motion.css): o topo fica travado e é a folha que o cobre. */
const FOLHA = typeof window === "undefined" ? ({} as MediaQueryList) : window.matchMedia("(prefers-reduced-motion: no-preference) and (min-width: 900px) and (min-height: 700px)");

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
    let current = false;
    const apply = (away: boolean) => {
      if (away === current && !first) return;
      const animate = !first && !prefersReducedMotion();
      first = false;
      current = away;
      setFloating(away);
      setMotion(animate ? (away ? "enter" : "exit") : null);
    };
    let off = () => {};
    const setup = () => {
      off();
      first = true;
      current = false;
      const rest = FOLHA.matches ? document.querySelector<HTMLElement>(".rest") : null;
      if (rest) {
        // Com a folha (#39, rodada 5) o topo fica travado e a folha o cobre: a cápsula entra quando a folha chega ao topo da janela (cobriu os controles), e sai quando ela volta a descer.
        const check = () => apply(rest.getBoundingClientRect().top <= 0);
        check();
        window.addEventListener("scroll", check, { passive: true });
        window.addEventListener("resize", check, { passive: true });
        off = () => {
          window.removeEventListener("scroll", check);
          window.removeEventListener("resize", check);
        };
      } else {
        const io = new IntersectionObserver(
          ([entry]) => apply(!entry.isIntersecting && entry.boundingClientRect.bottom < TOP_MARGIN),
          { rootMargin: `-${TOP_MARGIN}px 0px 0px 0px` },
        );
        io.observe(header);
        off = () => io.disconnect();
      }
    };
    setup();
    FOLHA.addEventListener("change", setup);
    return () => {
      FOLHA.removeEventListener("change", setup);
      off();
    };
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
