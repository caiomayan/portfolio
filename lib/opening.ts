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
/** O voo (FLIP; o script está em `openingFlightScript`): a assinatura encolhe e desliza até o topo enquanto a tela de cobertura some. Total da abertura ≈ 1,57 s. */
export const FLIGHT_MS = 620;
export const FLIGHT_EASING = "cubic-bezier(0.2, 0.7, 0.2, 1)"; // = --ease em app/motion.css

/** Eventos que pulam a abertura (passivos: o gesto segue). */
export const OPENING_SKIP_EVENTS = ["pointerdown", "keydown", "wheel", "touchstart", "scroll"];

/**
 * Script inline 1, antes de qualquer conteúdo: decide, sem esperar o JavaScript do React, se a abertura roda nesta visita.
 * O prazo de segurança chama o `finish` do script 2 (ou só tira o atributo, se o 2 não chegou a rodar).
 */
export const openingScript = `try{var d=document.documentElement;if(!sessionStorage.getItem("${OPENING_KEY}")&&!matchMedia("(prefers-reduced-motion: reduce)").matches&&!location.hash){sessionStorage.setItem("${OPENING_KEY}","1");d.dataset.${OPENING_ATTR}="run";window.__openingT0=performance.now();window.__openingTimer=setTimeout(function(){if(window.__openingFinish)window.__openingFinish();else delete d.dataset.${OPENING_ATTR}},${OPENING_FAILSAFE_MS})}}catch(e){}`;

/**
 * Script inline 2, depois do conteúdo (a cobertura e a assinatura do topo já estão no DOM) e antes da hidratação: faz o voo (FLIP invertido, WAAPI: a assinatura é assentada no tamanho e no lugar finais da do topo e parte do grande por transform, então o último quadro não tem transform nenhum e o traço de 1,5 px é o mesmo),
 * o fade do fundo da cobertura e o pular, sem esperar o React. A abertura dura ≈ 1,6 s depois da primeira pintura em qualquer CPU.
 * `finish` é idempotente: cancela as animações, esconde a cobertura e tira o atributo no mesmo quadro (a assinatura do topo reaparece).
 */
export const openingFlightScript = `(function(){var d=document.documentElement;if(d.dataset.${OPENING_ATTR}!=="run")return;var c=document.querySelector(".opening"),a=document.querySelector(".opening-art"),s=document.querySelector(".opening-scrim"),t=document.querySelector(".signature-mark");var ev=${JSON.stringify(OPENING_SKIP_EVENTS)},an=[],done=false;function finish(){if(done)return;done=true;for(var i=0;i<ev.length;i++)removeEventListener(ev[i],finish,true);an.forEach(function(x){x.cancel()});if(c)c.style.display="none";clearTimeout(window.__openingTimer);delete d.dataset.${OPENING_ATTR}}window.__openingFinish=finish;if(!c||!a||!s||!t||!a.animate){finish();return}var f=a.getBoundingClientRect(),o=t.getBoundingClientRect(),delay=Math.max(0,${DRAW_END_MS}-(performance.now()-window.__openingT0));a.style.cssText="position:fixed;left:"+o.left+"px;top:"+o.top+"px;width:"+o.width+"px;height:"+o.height+"px;transform-origin:0 0";var fl=a.animate([{transform:"translate("+(f.left-o.left)+"px,"+(f.top-o.top)+"px) scale("+f.width/o.width+","+f.height/o.height+")"},{transform:"none"}],{delay:delay,duration:${FLIGHT_MS},easing:"${FLIGHT_EASING}",fill:"both"});an.push(fl,s.animate([{opacity:1},{opacity:0}],{delay:delay,duration:${FLIGHT_MS},easing:"ease-out",fill:"both"}));fl.finished.then(finish,function(){});for(var i=0;i<ev.length;i++)addEventListener(ev[i],finish,{capture:true,passive:true})})();`;
