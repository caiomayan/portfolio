"use client";

import { useEffect } from "react";

const DESKTOP = "(hover: hover) and (pointer: fine)";
const REDUCED = "(prefers-reduced-motion: reduce)";

/**
 * Rolagem suave (lenis.dev) só no desktop (ponteiro fino com hover; no toque a rolagem segue nativa) e desligada
 * com prefers-reduced-motion. Lenis só interpreta a roda do mouse: teclado, barra de rolagem e busca da página
 * continuam nativos. Rola a janela de verdade, então o IntersectionObserver de components/reveal.tsx segue valendo.
 * O Lenis só é baixado quando as condições valem; se elas mudam (movimento reduzido, mouse ↔ toque), liga ou desliga.
 */
export function SmoothScroll() {
  useEffect(() => {
    const desktop = window.matchMedia(DESKTOP);
    const reduced = window.matchMedia(REDUCED);
    let lenis: import("lenis").default | null = null;
    let off: (() => void) | null = null;
    let alive = true;

    const stop = () => {
      off?.();
      off = null;
      lenis?.destroy();
      lenis = null;
    };

    const sync = async () => {
      const want = desktop.matches && !reduced.matches;
      if (!want) return stop();
      if (lenis) return;
      const { default: Lenis } = await import("lenis");
      if (!alive || lenis || !desktop.matches || reduced.matches) return;
      const instance = new Lenis({ autoRaf: true });
      lenis = instance;

      // Links internos (#carmine etc.): rolagem suave, endereço atualizado e foco no alvo (o próximo Tab parte dali).
      const onClick = (e: MouseEvent) => {
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
        if (!a || a.target || a.origin !== location.origin || a.pathname !== location.pathname || !a.hash || a.hash === "#") return;
        const target = document.getElementById(decodeURIComponent(a.hash.slice(1)));
        if (!target) return;
        e.preventDefault();
        instance.scrollTo(target);
        history.pushState(null, "", a.hash);
        if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
        target.focus({ preventScroll: true });
      };
      document.addEventListener("click", onClick);
      off = () => document.removeEventListener("click", onClick);
    };

    void sync();
    desktop.addEventListener("change", sync);
    reduced.addEventListener("change", sync);
    return () => {
      alive = false;
      desktop.removeEventListener("change", sync);
      reduced.removeEventListener("change", sync);
      stop();
    };
  }, []);

  return null;
}
