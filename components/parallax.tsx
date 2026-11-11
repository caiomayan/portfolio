"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { parallaxOffset } from "@/lib/parallax";
import { onLenisScroll } from "@/lib/scroll-bus";

const DESKTOP = "(hover: hover) and (pointer: fine)";
const REDUCED = "(prefers-reduced-motion: reduce)";
const MARGIN = 240; // camadas mais longe que isso da janela não são atualizadas

type Layer = { el: HTMLElement; factor: number; fromTop: boolean; top: number; height: number; offset: number };

/**
 * Parallax sutil (#39): camadas com velocidades levemente diferentes (foto e mapa da primeira tela, títulos das seções); o texto corrido
 * não se mexe. Só `translate` (família de transform), escrito direto no elemento, uma vez por quadro de rolagem do Lenis (components/smooth-scroll.tsx,
 * via lib/scroll-bus.ts) ou, se o Lenis não estiver ativo, do evento de rolagem nativo. As posições são medidas uma vez e de novo no resize
 * (nunca por quadro). Mesma regra do Lenis: só com ponteiro fino e hover (no celular fica desligado: a rolagem é nativa e uma camada movida
 * por script ficaria um quadro atrás) e desligado com prefers-reduced-motion; liga e desliga se a preferência muda com a página aberta.
 */
export function Parallax() {
  const pathname = usePathname(); // a troca de idioma troca o conteúdo sem recarregar: as camadas são procuradas de novo
  useEffect(() => {
    const desktop = window.matchMedia(DESKTOP);
    const reduced = window.matchMedia(REDUCED);
    let layers: Layer[] = [];
    let stop: (() => void) | null = null;

    const measure = () => {
      const y = window.scrollY;
      layers.forEach((l) => {
        const r = l.el.getBoundingClientRect();
        l.top = r.top + y - l.offset; // posição sem o próprio deslocamento
        l.height = r.height;
      });
    };

    const update = () => {
      const y = window.scrollY;
      const vh = window.innerHeight;
      for (const l of layers) {
        if (l.top > y + vh + MARGIN || l.top + l.height < y - MARGIN) continue; // fora da janela
        const distance = l.fromTop ? y : l.top + l.height / 2 - (y + vh / 2);
        const next = Math.round(parallaxOffset(distance, l.factor, l.fromTop) * 10) / 10;
        if (next === l.offset) continue;
        l.offset = next;
        l.el.style.translate = `0 ${next}px`;
      }
    };

    const start = () => {
      layers = Array.from(document.querySelectorAll<HTMLElement>("[data-parallax]")).map((el) => ({
        el,
        factor: Number(el.dataset.parallax),
        fromTop: el.dataset.parallaxFrom === "top",
        top: 0,
        height: 0,
        offset: 0,
      }));
      measure();
      update();
      let raf = 0;
      const onNative = () => {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(update);
      };
      const offLenis = onLenisScroll(update);
      window.addEventListener("scroll", onNative, { passive: true });
      const remeasure = () => {
        layers.forEach((l) => {
          l.el.style.translate = "";
          l.offset = 0;
        });
        measure();
        update();
      };
      const ro = new ResizeObserver(remeasure);
      ro.observe(document.body);
      layers.forEach((l) => (l.el.style.willChange = "translate"));
      stop = () => {
        offLenis();
        window.removeEventListener("scroll", onNative);
        cancelAnimationFrame(raf);
        ro.disconnect();
        layers.forEach((l) => {
          l.el.style.translate = "";
          l.el.style.willChange = "";
        });
        layers = [];
      };
    };

    const sync = () => {
      stop?.();
      stop = null;
      if (desktop.matches && !reduced.matches) start();
    };
    sync();
    desktop.addEventListener("change", sync);
    reduced.addEventListener("change", sync);
    return () => {
      desktop.removeEventListener("change", sync);
      reduced.removeEventListener("change", sync);
      stop?.();
    };
  }, [pathname]);

  return null;
}
