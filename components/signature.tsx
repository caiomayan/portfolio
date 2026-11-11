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

// Um caminho por letra (o "" do espaço não entra); calculado uma vez, no módulo.
export const drawnLetters = signature.glyphs.map((d, i) => ({ d, i })).filter((l) => l.d);

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
 * Assinatura "Caio Mayan" do topo: sempre pronta e visível (é o nome do site; o nome acessível fica no invólucro, que nunca é escondido).
 * Só durante a abertura (#39, `html[data-opening]`) o CSS a deixa invisível, porque a mesma assinatura está sendo desenhada, grande, por cima.
 */
export function Signature({ name }: { name: string }) {
  return (
    <span className="signature-mark" role="img" aria-label={name}>
      <svg className="signature" data-static="" viewBox={signature.viewBox} aria-hidden="true" focusable="false">
        <g fill="currentColor">
          <Filled />
        </g>
      </svg>
    </span>
  );
}
