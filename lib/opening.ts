/**
 * Abertura (#39): constantes compartilhadas entre o script inline (components/site-shell.tsx), o componente (components/opening.tsx)
 * e o CSS (app/motion.css, que repete os tempos do traço: se mudar aqui, mude lá).
 */
export const OPENING_KEY = "opening"; // sessionStorage: a abertura roda uma vez por aba
export const OPENING_ATTR = "opening"; // <html data-opening="run"> enquanto ela existe
/** Se o script do cliente não assumir a abertura nesse prazo, o atributo sai sozinho e nada fica escondido. */
export const OPENING_FAILSAFE_MS = 4000;

/** O traço (CSS, app/motion.css): 9 letras de 0,45 s, uma a cada 55 ms, depois de 50 ms. Termina em 0,05 + 8 × 0,055 + 0,45 = 0,94 s. */
export const DRAW_END_MS = 950;
/** O voo (FLIP): a assinatura encolhe e desliza até o topo enquanto a tela de cobertura some. Total da abertura ≈ 1,57 s. */
export const FLIGHT_MS = 620;
export const FLIGHT_EASING = "cubic-bezier(0.2, 0.7, 0.2, 1)"; // = --ease em app/motion.css

/** Script inline, antes de qualquer conteúdo: decide, sem esperar o JavaScript do React, se a abertura roda nesta visita. */
export const openingScript = `try{var d=document.documentElement;if(!sessionStorage.getItem("${OPENING_KEY}")&&!matchMedia("(prefers-reduced-motion: reduce)").matches&&!location.hash){sessionStorage.setItem("${OPENING_KEY}","1");d.dataset.${OPENING_ATTR}="run";window.__openingT0=performance.now();window.__openingTimer=setTimeout(function(){delete d.dataset.${OPENING_ATTR}},${OPENING_FAILSAFE_MS})}}catch(e){}`;
