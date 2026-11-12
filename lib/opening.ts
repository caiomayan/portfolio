/**
 * Abertura (#39): tempos, curvas e scripts compartilhados entre o script inline (components/site-shell.tsx), o componente (components/opening.tsx)
 * e o CSS (app/motion.css, que lê o tempo de cada letra de variáveis CSS postas em components/opening.tsx).
 *
 * Linha do tempo (ms depois do início, que é a primeira pintura em qualquer CPU):
 *   0 ─ 1760     traço: cada letra com o seu tempo (`LETTERS`), easing de escrita (acelera e desacelera em cada traço)
 *   1760 ─ 2020  respiro: a tinta assenta (a assinatura recua 1,5 %, `INHALE`)
 *   2020 ─ 2880  voo até o topo: X com expo-out, Y com outra curva (arco sutil), escala junto com o X
 *   2180 ─ 2800  a cobertura levanta, com atraso em relação à assinatura
 *   2140 ─ 2885  a primeira tela entra em sequência curta (sobe poucos px e aparece) enquanto a assinatura pousa
 * Só `transform` e `opacity` (o traço usa `stroke-dashoffset`, a exceção documentada). Sem blur nem brilho.
 */
export const OPENING_KEY = "opening"; // sessionStorage: a abertura roda uma vez por aba
export const OPENING_ATTR = "opening"; // <html data-opening="run"> enquanto ela existe
/** Se a coreografia travar, o prazo de segurança a encerra e tira o atributo (fica acima da duração total, ≈ 3 s). */
export const OPENING_FAILSAFE_MS = 5000;

/** O traço de cada letra, [início, duração] em ms. Letras longas (C, M, y) mais lentas; as ligaduras (a, i, o, a, n) mais rápidas e sobrepostas. */
export const LETTERS: ReadonlyArray<readonly [number, number]> = [
  [60, 340], // C
  [350, 200], // a
  [500, 160], // i
  [610, 200], // o
  [860, 320], // M (depois de uma pausa curta entre as palavras)
  [1130, 190], // a
  [1270, 290], // y
  [1510, 170], // a
  [1600, 160], // n
];
export const DRAW_END_MS = 1760;
/** Easing de escrita de cada traço (CSS): sai devagar, corre no meio, chega macio. */
export const STROKE_EASING = "cubic-bezier(0.45, 0.05, 0.25, 1)";

/** Respiro depois do último traço: a assinatura recua um pouco (a tinta assenta). Nada de brilho. */
export const SETTLE_MS = 260;
export const INHALE = 0.985;
export const INHALE_EASING = "cubic-bezier(0.4, 0, 0.2, 1)";

/** Voo até o topo. X (com a escala) em expo-out: sai decidido e chega macio, sem tranco; Y numa curva um pouco diferente, o que dá um arco sutil. */
export const FLIGHT_MS = 860;
export const FLIGHT_EASING_X = "cubic-bezier(0.16, 1, 0.3, 1)";
export const FLIGHT_EASING_Y = "cubic-bezier(0.32, 0.08, 0.12, 1)";
export const FLIGHT_START_MS = DRAW_END_MS + SETTLE_MS;
export const TOTAL_MS = FLIGHT_START_MS + FLIGHT_MS;

/** A cobertura (só o fundo, `opacity`) levanta um pouco depois de a assinatura partir. */
export const SCRIM_DELAY_MS = 160;
export const SCRIM_MS = 620;
export const SCRIM_EASING = "cubic-bezier(0.4, 0, 0.2, 1)";

/** A primeira tela entra em sequência (foto, título, frase, lugar, contato, controles) enquanto a assinatura pousa. */
export const CONTENT_SELECTORS = [".hero .who", ".hero h1", ".hero .lead", ".hero .place", ".hero .contact-icons", ".top-actions"]; // nesta ordem (não a do DOM)
export const CONTENT_DELAY_MS = 120; // depois do início do voo
export const CONTENT_STAGGER_MS = 45;
export const CONTENT_MS = 520;
export const CONTENT_RISE_PX = 14;
export const CONTENT_EASING = "cubic-bezier(0.16, 1, 0.3, 1)";
/** Até esse instante (antes do voo, com a cobertura ainda opaca) a primeira tela segue visível: é o que o LCP mede. Aí ela some por baixo da cobertura e depois sobe. */
export const CONTENT_HIDE_MS = FLIGHT_START_MS - 40;

/** A passada de brilho da assinatura (app/motion.css, `html[data-shine]`) só roda no fim natural da abertura (não ao pular, não na segunda visita, não com movimento reduzido); o atributo sai depois dela, pra um remonte do topo (troca de idioma) não a repetir. */
export const SHINE_CLEAR_MS = 1700;

/** Eventos que pulam a abertura (passivos: o gesto segue). */
export const OPENING_SKIP_EVENTS = ["pointerdown", "keydown", "wheel", "touchstart", "scroll"];

/**
 * Script inline 1, antes de qualquer conteúdo: decide, sem esperar o JavaScript do React, se a abertura roda nesta visita.
 * O prazo de segurança chama o `finish` do script 2 (ou só tira o atributo, se o 2 não chegou a rodar).
 */
export const openingScript = `try{var d=document.documentElement;if(!sessionStorage.getItem("${OPENING_KEY}")&&!matchMedia("(prefers-reduced-motion: reduce)").matches&&!location.hash){sessionStorage.setItem("${OPENING_KEY}","1");d.dataset.${OPENING_ATTR}="run";window.__openingT0=performance.now();window.__openingTimer=setTimeout(function(){if(window.__openingFinish)window.__openingFinish();else delete d.dataset.${OPENING_ATTR}},${OPENING_FAILSAFE_MS})}}catch(e){}`;

/**
 * Script inline 2, depois do conteúdo (a cobertura e a assinatura do topo já estão no DOM) e antes da hidratação: faz o respiro, o voo (FLIP
 * invertido, WAAPI), o levantar da cobertura, a entrada da primeira tela e o pular, sem esperar o React.
 *
 * FLIP invertido: a assinatura é assentada no tamanho e no lugar finais da do topo e parte do grande por `transform` até `none`; o último quadro não
 * tem transform nenhum e o contorno de 1,5 px é o mesmo da assinatura do topo (sem salto de espessura na troca). X e escala ficam no <svg>, Y no
 * invólucro (`.opening-art`), cada um com a sua curva. Todas as animações usam o mesmo relógio (o início da página, `__openingT0`): se o script chegou
 * tarde, elas começam já adiantadas. A primeira tela fica visível (opacity 1) até `CONTENT_HIDE_MS`, antes do voo: é o que o LCP mede; aí some por baixo da
 * cobertura, ainda opaca, e sobe em sequência (tudo no mesmo relógio e no compositor, sem timer, então dá pra buscar qualquer instante e não pisca se a thread estiver ocupada).
 * `finish` é idempotente: cancela as animações, esconde a cobertura e tira o atributo no mesmo quadro (a assinatura do topo reaparece).
 */
export const openingFlightScript = `(function(){var d=document.documentElement;if(d.dataset.${OPENING_ATTR}!=="run")return;var q=function(s){return document.querySelector(s)},c=q(".opening"),w=q(".opening-art"),v=q(".opening-art-svg"),s=q(".opening-scrim"),t=q(".signature-mark"),ev=${JSON.stringify(OPENING_SKIP_EVENTS)},an=[],done=false;function finish(nat){if(done)return;done=true;for(var i=0;i<ev.length;i++)removeEventListener(ev[i],finish,true);an.forEach(function(x){x.cancel()});if(c)c.style.display="none";clearTimeout(window.__openingTimer);delete d.dataset.${OPENING_ATTR};if(nat===true){d.dataset.shine="";setTimeout(function(){delete d.dataset.shine},${SHINE_CLEAR_MS})}}window.__openingFinish=finish;var T0=window.__openingT0||performance.now(),el=Math.max(0,performance.now()-T0),A=${DRAW_END_MS},B=${FLIGHT_START_MS},N=${TOTAL_MS};if(!c||!w||!v||!s||!t||!w.animate||el>B){finish();return}var f=v.getBoundingClientRect(),o=t.getBoundingClientRect(),sx=f.width/o.width,sy=f.height/o.height,dx=f.left-o.left,dy=f.top-o.top,k=${INHALE},ex=f.width*(1-k)/2,ey=f.height*(1-k)/2,big="translate("+dx+"px,0) scale("+sx+","+sy+")",hold="translate("+(dx+ex)+"px,0) scale("+sx*k+","+sy*k+")";w.style.cssText="position:fixed;left:"+o.left+"px;top:"+o.top+"px;width:"+o.width+"px;height:"+o.height+"px";v.style.cssText="width:100%;height:100%";function run(e,kf,opt){var a=e.animate(kf,opt);a.currentTime=el;an.push(a);return a}var oa=A/N,ob=B/N,x=run(v,[{transform:big,offset:0,easing:"linear"},{transform:big,offset:oa,easing:"${INHALE_EASING}"},{transform:hold,offset:ob,easing:"${FLIGHT_EASING_X}"},{transform:"none",offset:1}],{duration:N,fill:"both"});run(w,[{transform:"translateY("+dy+"px)",offset:0,easing:"linear"},{transform:"translateY("+dy+"px)",offset:oa,easing:"${INHALE_EASING}"},{transform:"translateY("+(dy+ey)+"px)",offset:ob,easing:"${FLIGHT_EASING_Y}"},{transform:"none",offset:1}],{duration:N,fill:"both"});run(s,[{opacity:1},{opacity:0}],{delay:B+${SCRIM_DELAY_MS},duration:${SCRIM_MS},easing:"${SCRIM_EASING}",fill:"both"});var last=x,H=${CONTENT_HIDE_MS};${JSON.stringify(CONTENT_SELECTORS)}.forEach(function(sel,i){var e=q(sel);if(!e)return;var up=i===5?0:${CONTENT_RISE_PX},S=B+${CONTENT_DELAY_MS}+i*${CONTENT_STAGGER_MS},D=S+${CONTENT_MS},hid={opacity:0,transform:"translateY("+up+"px)"};last=run(e,[{opacity:1,transform:"none",offset:0,easing:"linear"},{opacity:1,transform:"none",offset:H/D,easing:"linear"},{opacity:0,transform:"translateY("+up+"px)",offset:(H+20)/D,easing:"linear"},{opacity:0,transform:"translateY("+up+"px)",offset:S/D,easing:"${CONTENT_EASING}"},{opacity:1,transform:"none",offset:1}],{duration:D,fill:"both"})});last.finished.then(function(){finish(true)},function(){});for(var i=0;i<ev.length;i++)addEventListener(ev[i],finish,{capture:true,passive:true})})();`;
