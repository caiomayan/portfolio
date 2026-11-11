"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { signature } from "@/lib/signature";
import { DRAW_END_MS, FLIGHT_EASING, FLIGHT_MS, OPENING_ATTR } from "@/lib/opening";
import { drawnLetters, Filled } from "./signature";

const OUTLINE_PX = 1.5;
const MASK_STROKE = signature.fontSize * 0.22; // espessura do traço da máscara, proporcional à fonte
const [vx, vy, vw, vh] = signature.viewBox.split(" ").map(Number);
const maskRegion = { x: vx - MASK_STROKE, y: vy - MASK_STROKE, width: vw + 2 * MASK_STROKE, height: vh + 2 * MASK_STROKE };

const SKIP_EVENTS = ["pointerdown", "keydown", "wheel", "touchstart", "scroll"] as const;

/**
 * Abertura (#39): na primeira visita da aba, a assinatura aparece grande no centro e se escreve; depois encolhe e desliza até o lugar
 * dela no topo (FLIP, só transform) enquanto o fundo da cobertura some (só opacity). ≈ 1,57 s: 0,95 s de traço + 0,62 s de voo.
 *
 * Quem decide se ela roda é o script inline de components/site-shell.tsx (sessionStorage, movimento reduzido, endereço com #), que põe
 * `data-opening` no <html> antes da primeira pintura; o servidor já manda esta marcação e o CSS desenha o traço a partir da primeira
 * pintura, sem esperar o JavaScript. Aqui só entra o voo (WAAPI) e o pulo. Sem o atributo, nada aparece: a página já nasce pronta.
 * É decorativa (`aria-hidden`; o nome acessível é o da assinatura do topo, que continua no DOM) e sai do DOM no fim.
 */
export function Opening() {
  const [done, setDone] = useState(false);
  const cover = useRef<HTMLDivElement>(null);
  const scrim = useRef<HTMLDivElement>(null);
  const art = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    const w = window as Window & { __openingT0?: number; __openingTimer?: ReturnType<typeof setTimeout> };
    if (root.dataset[OPENING_ATTR] !== "run") {
      queueMicrotask(() => setDone(true)); // já rodou nesta aba, movimento reduzido ou o prazo de segurança passou: nada de abertura
      return;
    }
    clearTimeout(w.__openingTimer);
    const coverEl = cover.current;
    const artEl = art.current;
    const scrimEl = scrim.current;
    const target = document.querySelector<HTMLElement>(".signature-mark");
    if (!coverEl || !artEl || !scrimEl || !target) {
      delete root.dataset[OPENING_ATTR];
      queueMicrotask(() => setDone(true));
      return;
    }

    const animations: Animation[] = [];
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      for (const e of SKIP_EVENTS) window.removeEventListener(e, finish, true);
      animations.forEach((a) => a.cancel());
      coverEl.style.display = "none"; // some no mesmo quadro em que a assinatura do topo reaparece
      delete root.dataset[OPENING_ATTR];
      setDone(true);
    };

    // FLIP: o estado final (a assinatura do topo) é medido; a assinatura grande vai até ele só com transform.
    const from = artEl.getBoundingClientRect();
    const to = target.getBoundingClientRect();
    const scale = to.width / from.width;
    const elapsed = performance.now() - (w.__openingT0 ?? performance.now());
    const delay = Math.max(0, DRAW_END_MS - elapsed); // se a hidratação demorou, o traço já terminou: o voo começa na hora
    const timing: KeyframeAnimationOptions = { delay, duration: FLIGHT_MS, easing: FLIGHT_EASING, fill: "both" };
    const flight = artEl.animate(
      [{ transform: "none" }, { transform: `translate(${to.left - from.left}px, ${to.top - from.top}px) scale(${scale})` }],
      timing,
    );
    animations.push(flight, scrimEl.animate([{ opacity: 1 }, { opacity: 0 }], { ...timing, easing: "ease-out" }));
    flight.finished.then(finish, () => {});

    // Qualquer clique, tecla, rolagem ou toque pula a abertura e leva direto ao estado final. Passivos: nada é cancelado, o gesto segue.
    for (const e of SKIP_EVENTS) window.addEventListener(e, finish, { capture: true, passive: true });
    return finish;
  }, []);

  if (done) return null;
  return (
    <div className="opening" ref={cover} aria-hidden="true">
      <div className="opening-scrim" ref={scrim} />
      <svg className="opening-art" ref={art} viewBox={signature.viewBox} focusable="false" fill="none">
        <defs>
          <mask id="opening-reveal" maskUnits="userSpaceOnUse" {...maskRegion}>
            {drawnLetters.map((l, n) => (
              <path
                key={l.i}
                className="opening-stroke"
                pathLength={1}
                d={l.d}
                stroke="white"
                strokeWidth={MASK_STROKE}
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ "--i": n } as CSSProperties}
              />
            ))}
          </mask>
        </defs>
        {drawnLetters.map((l, n) => (
          <path
            key={l.i}
            className="opening-stroke"
            pathLength={1}
            d={l.d}
            stroke="currentColor"
            strokeWidth={OUTLINE_PX}
            vectorEffect="non-scaling-stroke"
            strokeLinejoin="round"
            style={{ "--i": n } as CSSProperties}
          />
        ))}
        <g mask="url(#opening-reveal)" fill="currentColor">
          <Filled />
        </g>
      </svg>
    </div>
  );
}
