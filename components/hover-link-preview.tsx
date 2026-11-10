"use client";

import { useEffect, useState, type ComponentProps, type PointerEvent } from "react";
import { createPortal } from "react-dom";
import Image, { type StaticImageData } from "next/image";
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";

/**
 * Link com preview flutuante no hover (#21), adaptado do HoverLinkPreview do 21st.dev.
 * O cartão com a imagem do site segue o ponteiro com mola e inclina conforme o lado do link em que o ponteiro está.
 * Só com mouse (`(hover: hover) and (pointer: fine)`): no toque e no teclado o link é o mesmo de sempre, sem cartão.
 * Com `prefers-reduced-motion: reduce` o cartão só aparece e some, parado acima do link.
 * O cartão é decorativo (`aria-hidden`, sem texto) e só anima transform e opacity (ver DESIGN.md → Movimento).
 */

const LARGURA = 192;
const ALTURA = 112;
const DESLOCAMENTO = 40; // distância entre o ponteiro e a base do cartão
const MARGEM = 8; // folga até a borda da janela
const INCLINACAO_MAX = 15; // graus
const MOLA_POSICAO = { stiffness: 300, damping: 30 };
const MOLA_INCLINACAO = { stiffness: 300, damping: 20 };

const PONTEIRO_FINO = "(hover: hover) and (pointer: fine)";

type Props = Omit<ComponentProps<"a">, "children"> & {
  href: string;
  /** Print do site (exibido em 192×112, arquivo em 2x). */
  image: StaticImageData;
  children: React.ReactNode;
};

const limita = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);

export function HoverLinkPreview({ image, children, onPointerEnter, onPointerLeave, onPointerMove, ...link }: Props) {
  const reduzido = useReducedMotion();
  const [aberto, setAberto] = useState(false);
  const [alvo, setAlvo] = useState<HTMLAnchorElement | null>(null);

  // Posição (canto superior esquerdo do cartão, em px da janela), com mola; inclinação à parte, mais solta.
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotacao = useMotionValue(0);
  const xMola = useSpring(x, MOLA_POSICAO);
  const yMola = useSpring(y, MOLA_POSICAO);
  const rotacaoMola = useSpring(rotacao, MOLA_INCLINACAO);

  // Baixa o print em tempo ocioso, só com mouse, pro primeiro hover não mostrar o cartão vazio.
  useEffect(() => {
    if (!matchMedia(PONTEIRO_FINO).matches) return;
    const carrega = () => {
      const img = new window.Image();
      img.src = image.src;
    };
    if ("requestIdleCallback" in window) {
      const id = requestIdleCallback(carrega);
      return () => cancelIdleCallback(id);
    }
    const id = setTimeout(carrega, 1500);
    return () => clearTimeout(id);
  }, [image.src]);

  const mira = (e: PointerEvent<HTMLAnchorElement>, primeira: boolean) => {
    const r = e.currentTarget.getBoundingClientRect();
    const larguraJanela = document.documentElement.clientWidth;
    if (reduzido) {
      // Parado: centrado acima do link, sem seguir o ponteiro.
      x.jump(limita(r.left + r.width / 2 - LARGURA / 2, MARGEM, larguraJanela - LARGURA - MARGEM));
      y.jump(Math.max(r.top - ALTURA - DESLOCAMENTO / 2, MARGEM));
      return;
    }
    const nx = limita(e.clientX - LARGURA / 2, MARGEM, larguraJanela - LARGURA - MARGEM);
    const ny = Math.max(e.clientY - ALTURA - DESLOCAMENTO, MARGEM);
    if (primeira) {
      // Entra já no lugar do ponteiro; a mola só vale pro que vem depois.
      x.jump(nx);
      y.jump(ny);
      xMola.jump(nx);
      yMola.jump(ny);
      rotacao.jump(0);
      rotacaoMola.jump(0);
    } else {
      x.set(nx);
      y.set(ny);
    }
    // -1 na ponta esquerda do link, +1 na direita.
    rotacao.set(limita((e.clientX - (r.left + r.width / 2)) / (r.width / 2), -1, 1) * INCLINACAO_MAX);
  };

  return (
    <>
      <a
        {...link}
        ref={setAlvo}
        onPointerEnter={(e) => {
          onPointerEnter?.(e);
          if (e.pointerType === "touch" || !matchMedia(PONTEIRO_FINO).matches) return;
          mira(e, true);
          setAberto(true);
        }}
        onPointerMove={(e) => {
          onPointerMove?.(e);
          if (aberto && !reduzido) mira(e, false);
        }}
        onPointerLeave={(e) => {
          onPointerLeave?.(e);
          setAberto(false);
        }}
      >
        {children}
      </a>
      {alvo &&
        createPortal(
          <AnimatePresence>
            {aberto && (
              <motion.div
                className="link-preview"
                aria-hidden="true"
                style={reduzido ? { x, y } : { x: xMola, y: yMola, rotate: rotacaoMola }}
                initial={reduzido ? false : { opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={reduzido ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, scale: 0.8 }}
                transition={reduzido ? { duration: 0 } : { type: "spring", stiffness: 260, damping: 24 }}
              >
                <Image src={image} alt="" width={LARGURA} height={ALTURA} unoptimized draggable={false} />
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}
