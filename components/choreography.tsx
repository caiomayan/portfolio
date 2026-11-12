"use client";

import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef } from "react";
import { OPENING_ATTR } from "@/lib/opening";

/** A variante da transição da primeira tela (#39, rodada 4, prévia): lida do <html> na primeira vez. A troca de idioma recria o layout raiz e o React apaga os `data-*` do <html> (como o do tema: components/theme-keeper.tsx), então ela é reposta antes da pintura. */
let variant: string | null = null;

/** A rota em que a coreografia foi armada. Fica no módulo (não numa ref): a troca de idioma pode remontar o componente, e a ref voltaria a vazio e armaria de novo. */
let armedPath: string | null = null;

/**
 * Coreografia das seções (#39). Só prepara: o GSAP e o código das coreografias (lib/choreography.ts) são baixados com `import()` depois da abertura
 * (`data-opening` sai do <html>) e do primeiro momento ocioso, então não pesam no primeiro carregamento, no LCP nem na abertura (um evento de rolagem
 * durante a abertura a pularia). Só arma uma vez, na rota em que a página foi aberta: a troca de idioma (a mesma página, conteúdo novo) desmonta e
 * **não arma de novo**, então nada toca outra vez e as partes ainda não tocadas voltam ao estado final. Falha de qualquer tipo = nada escondido.
 */
export function Choreography() {
  const pathname = usePathname();
  const teardown = useRef<(() => void) | null>(null);
  const heroOff = useRef<(() => void) | null>(null); // a transição da primeira tela (#39, rodada 4) é uma peça à parte: sobrevive à troca de idioma (é refeita depois dela)

  useLayoutEffect(() => {
    const d = document.documentElement;
    if (variant === null) variant = d.dataset.transicao ?? "";
    else if (variant) d.dataset.transicao = variant;
  }, [pathname]);

  // A troca de rota desmonta antes da pintura (layout effect), pra não aparecer um quadro com partes escondidas do idioma antigo.
  useLayoutEffect(
    () => () => {
      teardown.current?.();
      teardown.current = null;
      heroOff.current?.();
      heroOff.current = null;
    },
    [pathname],
  );

  useEffect(() => {
    if (armedPath === null) armedPath = pathname;
    if (armedPath !== pathname) {
      // Já houve troca de idioma: as seções não armam de novo, mas a transição da primeira tela (reversível, não esconde nada) é refeita no conteúdo novo, depois que a troca assenta.
      const t = window.setTimeout(() => {
        import("@/lib/choreography").then((m) => {
          heroOff.current?.();
          heroOff.current = m.armHero();
        }).catch(() => {});
      }, 700);
      return () => window.clearTimeout(t);
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return; // movimento reduzido: nada é preparado e o pacote nem é baixado
    let cancelled = false;
    // A troca de idioma avisa antes de mexer no DOM (components/lang-menu.tsx): desmonta já. Se o ScrollTrigger ainda tem gatilhos vivos quando o
    // conteúdo é trocado, o navegador leva a rolagem a 0 (visto no Chrome); sem gatilhos, a rolagem fica onde estava.
    const onSwitch = () => {
      cancelled = true;
      teardown.current?.();
      teardown.current = null;
      heroOff.current?.();
      heroOff.current = null;
    };
    window.addEventListener("lang-switch", onSwitch);
    let idle = 0;
    let mo: MutationObserver | null = null;
    const root = document.documentElement;

    const load = () => {
      import("@/lib/choreography")
        .then((m) => {
          if (cancelled) return;
          try {
            teardown.current = m.arm();
            heroOff.current = m.armHero();
          } catch {
            teardown.current?.();
            teardown.current = null; // nada preparado, nada escondido
          }
        })
        .catch(() => {});
    };
    const whenIdle = () => {
      if (typeof window.requestIdleCallback === "function") idle = window.requestIdleCallback(load, { timeout: 1500 });
      else idle = window.setTimeout(load, 300);
    };
    if (root.dataset[OPENING_ATTR]) {
      mo = new MutationObserver(() => {
        if (root.dataset[OPENING_ATTR]) return;
        mo?.disconnect();
        whenIdle();
      });
      mo.observe(root, { attributes: true, attributeFilter: ["data-" + OPENING_ATTR] });
    } else whenIdle();

    return () => {
      cancelled = true;
      window.removeEventListener("lang-switch", onSwitch);
      mo?.disconnect();
      if (typeof window.cancelIdleCallback === "function") window.cancelIdleCallback(idle);
      clearTimeout(idle);
    };
  }, [pathname]);

  return null;
}
