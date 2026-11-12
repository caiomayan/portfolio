/*
 * Baseado no componente Signature do componentry.dev (github.com/harshjdhv/componentry).
 * MIT License. Copyright (c) 2026 Harsh Jadhav.
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
 * documentation files (the "Software"), to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software,
 * subject to the following conditions: the above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software. THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 *
 * Mudanças: contornos pré-gerados em lib/signature.ts (scripts/generate-signature.mjs), então nem a fonte nem o
 * opentype.js vão pro navegador; desde a #39 o desenho do traço é CSS, na abertura (components/opening.tsx), e a
 * assinatura do topo é sempre a versão pronta.
 */
import { signature } from "@/lib/signature";

const [vx, vy, vw, vh] = signature.viewBox.split(" ").map(Number);
/** Largura da faixa de brilho e quanto ela corre (em unidades do viewBox) na passada única do fim da abertura (app/motion.css). */
const GLARE_W = vw * 0.38;
const GLARE_TRAVEL = vw + GLARE_W;

// Um caminho por letra (o "" do espaço não entra); calculado uma vez, no módulo.
export const drawnLetters = signature.glyphs.map((d, i) => ({ d, i })).filter((l) => l.d);

/** Espessura do contorno em px de tela, igual à da assinatura de antes da #39 (`non-scaling-stroke`: não muda com o tamanho do desenho). */
export const OUTLINE_PX = 1.5;

/** O contorno de cada letra: uma camada de traço sobre o preenchimento, como na assinatura desenhada de antes da #39 (é ele que dá o peso do traço). */
export function Outline() {
  return (
    <>
      {drawnLetters.map((l) => (
        <path key={l.i} className="signature-outline" d={l.d} fill="none" stroke="currentColor" strokeWidth={OUTLINE_PX} vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
      ))}
    </>
  );
}

/** As letras já prontas, sem animação. */
export function Filled() {
  return (
    <>
      {drawnLetters.map((l) => (
        <path key={l.i} d={l.d} />
      ))}
    </>
  );
}

/**
 * Assinatura "Caio Mayan" do topo, igual ao estado final da assinatura desenhada de antes da #39 (contorno de 1,5 px mais o preenchimento) em todos os casos (recarregar, movimento reduzido, sem JavaScript, troca de idioma): sempre pronta e visível (é o nome do site; o nome acessível fica no invólucro, que nunca é escondido).
 * Só durante a abertura (#39, `html[data-opening]`) o CSS a deixa invisível, porque a mesma assinatura está sendo desenhada, grande, por cima.
 */
export function Signature({ name }: { name: string }) {
  return (
    <span className="signature-mark" role="img" aria-label={name}>
      <svg className="signature" data-static="" viewBox={signature.viewBox} aria-hidden="true" focusable="false">
        <Outline />
        <g id="signature-fill" fill="currentColor">
          <Filled />
        </g>
        {/* Passada única de brilho depois que a abertura termina (#39, rodada 4; app/motion.css): uma faixa de --bg translúcida que corre por cima das letras,
            recortada pela máscara estática (as mesmas letras, por <use>: não cria caminhos novos). Só `transform`; parada e invisível o resto do tempo. */}
        <defs>
          <mask id="signature-glare-mask" maskUnits="userSpaceOnUse" x={vx} y={vy} width={vw} height={vh}>
            <use href="#signature-fill" style={{ color: "#fff" }} />
          </mask>
          <linearGradient id="signature-glare-grad" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" style={{ stopColor: "var(--bg)", stopOpacity: 0 }} />
            <stop offset="0.5" style={{ stopColor: "var(--bg)", stopOpacity: 0.6 }} />
            <stop offset="1" style={{ stopColor: "var(--bg)", stopOpacity: 0 }} />
          </linearGradient>
        </defs>
        <g mask="url(#signature-glare-mask)">
          <rect className="signature-glare" x={vx - GLARE_W} y={vy} width={GLARE_W} height={vh} fill="url(#signature-glare-grad)" style={{ "--glare-travel": `${GLARE_TRAVEL}px` } as React.CSSProperties} />
        </g>
      </svg>
    </span>
  );
}
