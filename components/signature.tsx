import type { CSSProperties } from "react";
import { signature } from "@/lib/signature";

/**
 * Assinatura do nome, desenhada traço a traço na abertura (CSS em app/motion.css).
 * Decorativa: o nome já está no texto da página. Sem animação, aparece pronta.
 */
export function Signature() {
  return (
    <svg className="signature" viewBox={signature.viewBox} aria-hidden="true" focusable="false">
      {signature.strokes.map((s, i) => (
        <path
          key={i}
          d={s.d}
          pathLength={1}
          style={{ "--signature-delay": `${s.delay}ms`, "--signature-duration": `${s.duration}ms` } as CSSProperties}
        />
      ))}
    </svg>
  );
}
