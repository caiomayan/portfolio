"use client";

import { useEffect } from "react";
import { REPO_URL } from "@/lib/site";

/** Uma vez por carga da página: a troca de idioma não repete o recado. */
let shown = false;

/**
 * Recado no console (#46): uma mensagem curta e discreta (um `console.info` estilizado) pra quem abre o DevTools, com o link do repositório,
 * na língua da página. Sai depois da página pronta (`load` + ocioso), então não pesa no LCP; é `info`, não `error`, e não aparece na tela.
 */
export function ConsoleNote({ message }: { message: string }) {
  useEffect(() => {
    if (shown) return;
    let cancelled = false;
    const say = () => {
      if (cancelled || shown) return;
      shown = true;
      console.info(`%c${message}%c ${REPO_URL}`, "color:#888;font:12px/1.5 system-ui,sans-serif", "color:inherit;font:12px/1.5 system-ui,sans-serif");
    };
    const later = () => {
      if ("requestIdleCallback" in window) window.requestIdleCallback(say, { timeout: 2000 });
      else setTimeout(say, 1000);
    };
    if (document.readyState === "complete") later();
    else window.addEventListener("load", later, { once: true });
    return () => {
      cancelled = true;
      window.removeEventListener("load", later);
    };
  }, [message]);
  return null;
}
