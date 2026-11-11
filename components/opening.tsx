"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { signature } from "@/lib/signature";
import { LETTERS, OPENING_ATTR } from "@/lib/opening";
import { drawnLetters, Filled, OUTLINE_PX } from "./signature";

const MASK_STROKE = signature.fontSize * 0.22; // espessura do traço da máscara, proporcional à fonte
const [vx, vy, vw, vh] = signature.viewBox.split(" ").map(Number);
const maskRegion = {
  x: vx - MASK_STROKE,
  y: vy - MASK_STROKE,
  width: vw + 2 * MASK_STROKE,
  height: vh + 2 * MASK_STROKE,
};

/** O tempo de cada letra (lib/opening.ts) vai pro CSS por variáveis: início e duração do traço. */
const stroke = (n: number) =>
  ({
    "--s": `${LETTERS[n][0]}ms`,
    "--d": `${LETTERS[n][1]}ms`,
  }) as CSSProperties;

/**
 * Abertura (#39): na primeira visita da aba, a assinatura aparece grande no centro e se escreve (1,76 s, cada letra no seu ritmo); a tinta assenta num
 * respiro (0,26 s) e ela voa até o lugar dela no topo (0,86 s, FLIP só transform, X e Y com curvas diferentes) enquanto a cobertura levanta e a primeira tela
 * entra em sequência. ≈ 3 s no total. Os tempos e as curvas estão em lib/opening.ts.
 *
 * **Toda a coreografia roda fora do React**, pra não depender da hidratação: dois scripts inline (lib/opening.ts, postos em components/site-shell.tsx)
 * decidem se a abertura roda (sessionStorage, movimento reduzido, endereço com #), fazem o voo e o fade (WAAPI) e tratam o pular e o prazo de
 * segurança. O traço é CSS (app/motion.css), desde a primeira pintura. Este componente só renderiza a marcação (servidor e cliente iguais) e a
 * tira do DOM quando a abertura acaba ou nunca rodou: o React é dono desse nó, então só ele o remove. Decorativa (`aria-hidden`).
 */
export function Opening() {
  const [done, setDone] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (root.dataset[OPENING_ATTR] !== "run") {
      queueMicrotask(() => setDone(true)); // já rodou nesta aba, movimento reduzido ou terminou antes da hidratação
      return;
    }
    const mo = new MutationObserver(() => {
      if (root.dataset[OPENING_ATTR] !== "run") setDone(true);
    });
    mo.observe(root, {
      attributes: true,
      attributeFilter: ["data-" + OPENING_ATTR],
    });
    return () => mo.disconnect();
  }, []);

  if (done) return null;
  return (
    <div className="opening" aria-hidden="true" suppressHydrationWarning>
      <div className="opening-scrim" />
      <div className="opening-art">
        <svg
          className="opening-art-svg"
          viewBox={signature.viewBox}
          focusable="false"
          fill="none"
        >
          <defs>
            <mask
              id="opening-reveal"
              maskUnits="userSpaceOnUse"
              {...maskRegion}
            >
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
                  style={stroke(n)}
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
              style={stroke(n)}
            />
          ))}
          <g mask="url(#opening-reveal)" fill="currentColor">
            <Filled />
          </g>
        </svg>
      </div>
    </div>
  );
}
