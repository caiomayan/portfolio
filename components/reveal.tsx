"use client";

import { useEffect } from "react";
import { prefersReducedMotion } from "@/lib/motion";

/** As partes de cada seção que entram em sequência ao chegar na tela. */
const TARGETS = [
  "#carmine .carmine-aside",
  "#carmine .carmine-body > *",
  ":is(#experiencia, #formacao) h2",
  ":is(#experiencia, #formacao) .entry",
  ".contact h2",
  ".contact .mail",
  ".contact .contact-links",
].join(", ");

const STEP_MS = 70;
const MAX_STEPS = 5;

/**
 * Entrada escalonada ao rolar, disparada uma vez por parte.
 * O estado escondido só é aplicado aqui, no cliente, e só ao que ainda está abaixo da tela:
 * se o script falhar, nada chegou a ser escondido. Sem animação (prefers-reduced-motion), não faz nada.
 */
export function Reveal() {
  useEffect(() => {
    if (prefersReducedMotion() || !("IntersectionObserver" in window)) return;

    const below = window.innerHeight * 0.92;
    const hidden: HTMLElement[] = [];
    const seen = new Map<Element, number>(); // seção → quantas partes já têm atraso
    document.querySelectorAll<HTMLElement>(TARGETS).forEach((el) => {
      if (el.getBoundingClientRect().top <= below) return; // já na tela (ou acima): fica como está
      const section = el.closest("section") ?? document.body;
      const n = seen.get(section) ?? 0;
      seen.set(section, n + 1);
      el.style.setProperty("--reveal-delay", `${Math.min(n, MAX_STEPS) * STEP_MS}ms`);
      el.dataset.reveal = "pending";
      hidden.push(el);
    });
    if (!hidden.length) return;
    void document.body.offsetHeight; // fixa o estado escondido antes de observar, pra transição partir dele

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          (e.target as HTMLElement).dataset.reveal = "in";
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
