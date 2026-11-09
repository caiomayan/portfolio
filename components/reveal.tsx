"use client";

import { useEffect } from "react";
import { prefersReducedMotion } from "@/lib/motion";
import { REVEAL_PART_SELECTOR, REVEAL_STATE } from "@/lib/reveal";

/** Atraso entre uma parte e a seguinte da mesma seção, e quantos passos de atraso no máximo. */
const STAGGER_STEP_MS = 70;
const MAX_STAGGER_STEPS = 5;

/**
 * Entrada escalonada ao rolar, disparada uma vez por parte. Não conhece as seções: só procura
 * o atributo `data-reveal-part`, que cada componente põe nas suas partes.
 * O estado escondido só é aplicado aqui, no cliente, e só ao que ainda está abaixo da tela:
 * se o script falhar, nada chegou a ser escondido. Sem animação (prefers-reduced-motion), não faz nada.
 */
export function Reveal() {
  useEffect(() => {
    if (prefersReducedMotion() || !("IntersectionObserver" in window)) return;

    // Só o que está inteiro abaixo da tela entra escondido: o que já aparece no carregamento nunca some e volta (isso atrasaria o LCP).
    const hidden: HTMLElement[] = [];
    const partsHiddenBySection = new Map<Element, number>(); // seção → quantas partes já têm atraso
    document.querySelectorAll<HTMLElement>(REVEAL_PART_SELECTOR).forEach((el) => {
      if (el.getBoundingClientRect().top < window.innerHeight) return; // já aparece (ou está acima): fica como está
      const section = el.closest("section") ?? document.body;
      const n = partsHiddenBySection.get(section) ?? 0;
      partsHiddenBySection.set(section, n + 1);
      el.style.setProperty("--reveal-delay", `${Math.min(n, MAX_STAGGER_STEPS) * STAGGER_STEP_MS}ms`);
      el.dataset.reveal = REVEAL_STATE.hidden;
      hidden.push(el);
    });
    if (!hidden.length) return;
    void document.body.offsetHeight; // fixa o estado escondido antes de observar, pra transição partir dele

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          (e.target as HTMLElement).dataset.reveal = REVEAL_STATE.shown;
          io.unobserve(e.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    hidden.forEach((el) => io.observe(el));

    return () => {
      io.disconnect();
      hidden.forEach((el) => {
        delete el.dataset.reveal;
        el.style.removeProperty("--reveal-delay");
      });
    };
  }, []);

  return null;
}
