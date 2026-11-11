"use client";

/*
 * Baseado no componente Signature do componentry.dev (github.com/harshjdhv/componentry).
 * MIT License. Copyright (c) 2026 Harsh Jadhav.
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
 * documentation files (the "Software"), to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software,
 * subject to the following conditions: the above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software. THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 *
 * Mudanças: usa o pacote `motion` (não framer-motion) e os contornos pré-gerados em lib/signature.ts
 * (scripts/generate-signature.mjs), então nem a fonte nem o opentype.js vão pro navegador.
 */
import { motion } from "motion/react";
import { useEffect, useId, useSyncExternalStore } from "react";
import { prefersReducedMotion } from "@/lib/motion";
import { signature } from "@/lib/signature";

const LETTER_GAP_S = 0.2; // entre uma letra e a próxima
const DRAW_S = 1; // duração do traço de cada letra
const START_S = 0.25;
const OUTLINE_PX = 1.5;
const MASK_STROKE = signature.fontSize * 0.22; // espessura do traço da máscara, proporcional à fonte
const MASK_PAD = MASK_STROKE; // folga da máscara em volta do viewBox, pro traço grosso não cortar nas bordas

// Região da máscara derivada do viewBox ("x y w h"): nada de medida fixa.
const [viewBoxX, viewBoxY, viewBoxWidth, viewBoxHeight] = signature.viewBox.split(" ").map(Number);
const maskRegion = {
  x: viewBoxX - MASK_PAD,
  y: viewBoxY - MASK_PAD,
  width: viewBoxWidth + 2 * MASK_PAD,
  height: viewBoxHeight + 2 * MASK_PAD,
};

// Um caminho por letra (o "" do espaço não entra); calculado uma vez, no módulo.
const drawnLetters = signature.glyphs.map((d, i) => ({ d, i })).filter((l) => l.d);

const noSubscription = () => () => {};

/** A assinatura já foi desenhada nesta sessão do navegador? A troca de idioma (#38) recria a barra do topo sem recarregar a página: ali ela aparece pronta, sem desenhar de novo. */
let drawn = false;

const variants = { hidden: { pathLength: 0, opacity: 0 }, visible: { pathLength: 1, opacity: 1 } };

/** As letras já prontas, sem animação: usado no render estático e como a camada de preenchimento da animada. */
function Filled() {
  return (
    <>
      {drawnLetters.map((l) => (
        <path key={l.i} d={l.d} />
      ))}
    </>
  );
}

/**
 * Assinatura "Caio Mayan", desenhada letra a letra na abertura. É o nome do site: o nome acessível fica num invólucro
 * que nunca é escondido (o SVG fica `visibility: hidden` até o script trocar pela versão animada).
 */
export function Signature({ name }: { name: string }) {
  return (
    <span className="signature-mark" role="img" aria-label={name}>
      <SignatureArt />
    </span>
  );
}

function SignatureArt() {
  const maskId = `signature-reveal-${useId().replace(/:/g, "")}`;
  // Primeiro render (servidor e cliente) = assinatura pronta; só depois do mount, sem movimento reduzido, passa a desenhar.
  const animated = useSyncExternalStore(noSubscription, () => !drawn && !prefersReducedMotion(), () => false);
  // Só marca ao sair: durante a vida deste componente o valor não muda, e a próxima montagem (troca de idioma) já nasce pronta.
  useEffect(
    () => () => {
      drawn = true;
    },
    [],
  );

  const timing = (i: number) => ({
    pathLength: { delay: START_S + i * LETTER_GAP_S, duration: DRAW_S, ease: "easeInOut" as const },
    opacity: { delay: START_S + i * LETTER_GAP_S + 0.01, duration: 0.01 },
  });

  if (!animated) {
    return (
      <svg className="signature" data-static="" data-drawn={drawn ? "" : undefined} viewBox={signature.viewBox} aria-hidden="true" focusable="false">
        <g fill="currentColor">
          <Filled />
        </g>
      </svg>
    );
  }

  return (
    <motion.svg className="signature" viewBox={signature.viewBox} aria-hidden="true" focusable="false" fill="none" initial="hidden" animate="visible">
      <defs>
        <mask id={maskId} maskUnits="userSpaceOnUse" {...maskRegion}>
          {drawnLetters.map((l) => (
            <motion.path
              key={l.i}
              d={l.d}
              stroke="white"
              strokeWidth={MASK_STROKE}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              variants={variants}
              transition={timing(l.i)}
            />
          ))}
        </mask>
      </defs>
      {drawnLetters.map((l) => (
        <motion.path
          key={l.i}
          d={l.d}
          stroke="currentColor"
          strokeWidth={OUTLINE_PX}
          vectorEffect="non-scaling-stroke"
          strokeLinejoin="round"
          fill="none"
          variants={variants}
          transition={timing(l.i)}
        />
      ))}
      <g mask={`url(#${maskId})`} fill="currentColor">
        <Filled />
      </g>
    </motion.svg>
  );
}
