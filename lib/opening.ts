/**
 * Abertura (#39): tempos, curvas e scripts compartilhados entre o script inline (components/site-shell.tsx), o componente (components/opening.tsx)
 * e o CSS (app/motion.css, que lê o tempo de cada letra de variáveis CSS postas em components/opening.tsx).
 *
 * Linha do tempo (ms depois do início, que é a primeira pintura em qualquer CPU), ≈ 3,2 s:
 *   0 ─ 1760     traço: cada letra com o seu tempo (`LETTERS`), easing de escrita; o traço nasce
 *                mais leve e encorpa (opacidade do contorno .55 → 1) até o respiro; a assinatura escreve levemente inclinada (-1,6°)
 *   1760 ─ 2020  respiro: a tinta assenta (a assinatura recua 1,5 %, `INHALE`)
 *   2020 ─ 2940  voo até o topo: mola sem quique (`linear()` gerado, `spring`), X/escala e Y com rigidezes diferentes (arco) e a inclinação se desfaz junto
 *   2100 ─ 3040  a cobertura se recolhe pra cima como uma folha (translateY, com cantos de baixo arredondados e sombra, como a folha da transição) e revela a primeira tela
 *   2180 ─ 3000  a primeira tela sobe ao lugar em sequência (foto, título, frase, lugar, contato, controles), sob a borda da cobertura
 *   2940 ─ 3160  assentamento: a assinatura chega 1,5 % maior e encaixa no topo; em seguida o brilho único (app/motion.css)
 * Só `transform` e `opacity` (o traço usa `stroke-dashoffset`, a exceção documentada). Sem blur.
 */
export const OPENING_KEY = "opening"; // sessionStorage: a abertura roda uma vez por aba
export const OPENING_ATTR = "opening"; // <html data-opening="run"> enquanto ela existe
/** Se a coreografia travar, o prazo de segurança a encerra e tira o atributo (fica acima da duração total, ≈ 3,2 s). */
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
/** Easing de escrita de cada traço (CSS): sai devagar, corre no meio, chega macio.  */
export const STROKE_EASING = "cubic-bezier(0.45, 0.05, 0.25, 1)";

/** Respiro depois do último traço: a assinatura recua um pouco (a tinta assenta). Nada de brilho. */
export const SETTLE_MS = 260;
export const INHALE = 0.985;
export const INHALE_EASING = "cubic-bezier(0.4, 0, 0.2, 1)";
/** O traço nasce mais leve e encorpa (opacidade do contorno) até o fim do respiro: simula a pressão da caneta. */
export const INK_FROM = 0.55;
/** A assinatura escreve levemente inclinada e se endireita no voo (mão, não máquina). */
export const TILT_DEG = -1.6;

/**
 * Mola sem quique (criticamente amortecida: x(t) = 1 − (1 + ωt)·e^(−ωt)), gerada como `linear()` e normalizada pra chegar exatamente em 1 no fim da duração
 * (sobra de ~2 % na cauda, sem salto: a velocidade final é ~6 % do pico). Rigidezes diferentes em X e Y dão o arco do voo.
 */
export function spring(omega: number, ms: number, steps = 48): string {
  const raw = (t: number) => 1 - (1 + omega * t) * Math.exp(-omega * t);
  const end = raw(ms / 1000);
  const pts: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const v = i === steps ? 1 : raw((ms / 1000) * (i / steps)) / end;
    pts.push(String(Math.round(v * 1000) / 1000));
  }
  return `linear(${pts.join(", ")})`;
}

/** Voo até o topo (mola; X com a escala mais firme, Y mais mole). Sem suporte a `linear()` o script cai nestas curvas. */
export const FLIGHT_MS = 920;
export const FLIGHT_OMEGA_X = 6.6;
export const FLIGHT_OMEGA_Y = 5.6;
export const FLIGHT_EASING_X = "cubic-bezier(0.16, 1, 0.3, 1)";
export const FLIGHT_EASING_Y = "cubic-bezier(0.32, 0.08, 0.12, 1)";
export const FLIGHT_START_MS = DRAW_END_MS + SETTLE_MS;
/** Assentamento no pouso: a assinatura chega 1,5 % maior e encaixa (ease-out, sem quique). */
export const LAND_SCALE = 1.015;
export const LAND_MS = 220;
export const LAND_EASING = "cubic-bezier(0.3, 0, 0.2, 1)";
export const TOTAL_MS = FLIGHT_START_MS + FLIGHT_MS + LAND_MS;

/** A cobertura é uma folha: se recolhe pra cima (translateY) um pouco depois de a assinatura partir; `SCRIM_TRAVEL` passa de 100 % pra sombra de baixo sair da tela. */
export const SCRIM_DELAY_MS = 80;
export const SCRIM_MS = 940;
export const SCRIM_OMEGA = 5.4;
export const SCRIM_TRAVEL = "-112%";
export const SCRIM_EASING = "cubic-bezier(0.4, 0, 0.2, 1)";

/**
 * A primeira tela sobe ao lugar em sequência enquanto a borda da cobertura passa. Ela fica sempre visível (opacity 1) por baixo da cobertura opaca: é o que o LCP mede,
 * e nada precisa ser escondido. Só um deslocamento (`transform`); a opacidade fica presa em 1 pelos mesmos quadros-chave, porque o WAAPI vence a entrada em CSS (app/globals.css), que parte de opacity 0 e atrasaria o LCP.
 */
export const CONTENT_SELECTORS = [".hero .who", ".hero h1", ".hero .lead, .hero .lead-glare", ".hero .place", ".hero .contact-icons", ".top-actions"]; // nesta ordem (não a do DOM); a frase leva junto a camada de brilho (`.lead-glare`), pra os dois subirem juntos
export const CONTENT_DELAY_MS = 160; // depois do início do voo
export const CONTENT_STAGGER_MS = 50;
export const CONTENT_MS = 700;
export const CONTENT_RISE_PX = 28;
export const CONTENT_EASING = "cubic-bezier(0.16, 1, 0.3, 1)";

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
 * invertido, WAAPI), o recolher da cobertura, a entrada da primeira tela e o pular, sem esperar o React.
 *
 * FLIP invertido: a assinatura é assentada no tamanho e no lugar finais da do topo e parte do grande por `transform` até `none`; o último quadro não
 * tem transform nenhum e o contorno de 1,5 px é o mesmo da assinatura do topo (sem salto de espessura na troca). X e escala ficam no <svg> (uma só string
 * `translate() scale(sx, sy)`, sem rotação: com sx ≠ sy ela entortaria), Y e a inclinação no invólucro (`.opening-art`, com a origem no centro da assinatura grande).
 * Todas as animações usam o mesmo relógio (o início da página, `__openingT0`): se o script chegou tarde, elas começam já adiantadas, e tudo no compositor, sem timer: dá pra buscar qualquer instante.
 * As molas são `linear()` gerados em lib/opening.ts; sem suporte (`CSS.supports`) o script usa as curvas de antes (um easing que o navegador não entende faria `animate` lançar e
 * derrubaria o script no meio).
 * `finish` é idempotente: cancela as animações, esconde a cobertura e tira o atributo no mesmo quadro (a assinatura do topo reaparece).
 */
const flightSource = `(function(){
var d=document.documentElement;if(d.dataset.${OPENING_ATTR}!=="run")return;
var q=function(s){return document.querySelector(s)},c=q(".opening"),w=q(".opening-art"),v=q(".opening-art-svg"),s=q(".opening-scrim"),t=q(".signature-mark"),ink=q(".opening-ink"),
ev=${JSON.stringify(OPENING_SKIP_EVENTS)},an=[],done=false;
function finish(nat){if(done)return;done=true;for(var i=0;i<ev.length;i++)removeEventListener(ev[i],finish,true);an.forEach(function(x){x.cancel()});if(c)c.style.display="none";clearTimeout(window.__openingTimer);delete d.dataset.${OPENING_ATTR};if(nat===true){d.dataset.shine="";setTimeout(function(){delete d.dataset.shine},${SHINE_CLEAR_MS})}}
window.__openingFinish=finish;
var T0=window.__openingT0||performance.now(),el=Math.max(0,performance.now()-T0),A=${DRAW_END_MS},B=${FLIGHT_START_MS},F=${FLIGHT_MS},N=${TOTAL_MS};
if(!c||!w||!v||!s||!t||!w.animate||el>B){finish();return}
var sp=window.CSS&&CSS.supports&&CSS.supports("animation-timing-function","linear(0, 1)");
var EX=sp?${JSON.stringify(spring(FLIGHT_OMEGA_X, FLIGHT_MS))}:"${FLIGHT_EASING_X}",EY=sp?${JSON.stringify(spring(FLIGHT_OMEGA_Y, FLIGHT_MS))}:"${FLIGHT_EASING_Y}",ES=sp?${JSON.stringify(spring(SCRIM_OMEGA, SCRIM_MS))}:"${SCRIM_EASING}";
var f=v.getBoundingClientRect(),o=t.getBoundingClientRect(),sx=f.width/o.width,sy=f.height/o.height,dx=f.left-o.left,dy=f.top-o.top,k=${INHALE},ex=f.width*(1-k)/2,ey=f.height*(1-k)/2,L=${LAND_SCALE},lx=o.width*(L-1)/2,ly=o.height*(L-1)/2,tilt=${TILT_DEG};
var big="translate("+dx+"px,0) scale("+sx+","+sy+")",hold="translate("+(dx+ex)+"px,0) scale("+sx*k+","+sy*k+")",land="translate("+(-lx)+"px,0) scale("+L+","+L+")";
w.style.cssText="position:fixed;left:"+o.left+"px;top:"+o.top+"px;width:"+o.width+"px;height:"+o.height+"px;transform-origin:"+(dx+f.width/2)+"px "+(f.height/2)+"px";
v.style.cssText="width:100%;height:100%";
function run(e,kf,opt){var a=e.animate(kf,opt);a.currentTime=el;an.push(a);return a}
var oa=A/N,ob=B/N,oc=(B+F)/N;
var x=run(v,[{transform:big,offset:0,easing:"linear"},{transform:big,offset:oa,easing:"${INHALE_EASING}"},{transform:hold,offset:ob,easing:EX},{transform:land,offset:oc,easing:"${LAND_EASING}"},{transform:"none",offset:1}],{duration:N,fill:"both"});
run(w,[{transform:"translateY("+dy+"px) rotate("+tilt+"deg)",offset:0,easing:"linear"},{transform:"translateY("+dy+"px) rotate("+tilt+"deg)",offset:oa,easing:"${INHALE_EASING}"},{transform:"translateY("+(dy+ey)+"px) rotate("+tilt+"deg)",offset:ob,easing:EY},{transform:"translateY("+(-ly)+"px) rotate(0deg)",offset:oc,easing:"${LAND_EASING}"},{transform:"none",offset:1}],{duration:N,fill:"both"});
if(ink)run(ink,[{opacity:${INK_FROM}},{opacity:1}],{duration:B,easing:"cubic-bezier(0.2, 0.6, 0.3, 1)",fill:"both"});
run(s,[{transform:"none"},{transform:"translateY(${SCRIM_TRAVEL})"}],{delay:B+${SCRIM_DELAY_MS},duration:${SCRIM_MS},easing:ES,fill:"both"});
${JSON.stringify(CONTENT_SELECTORS)}.forEach(function(sel,i){var S=B+${CONTENT_DELAY_MS}+i*${CONTENT_STAGGER_MS},D=S+${CONTENT_MS},up="translateY(${CONTENT_RISE_PX}px)";document.querySelectorAll(sel).forEach(function(e){run(e,[{opacity:1,transform:up,offset:0,easing:"linear"},{opacity:1,transform:up,offset:S/D,easing:"${CONTENT_EASING}"},{opacity:1,transform:"none",offset:1}],{duration:D,fill:"both"})})});
x.finished.then(function(){finish(true)},function(){});
for(var i=0;i<ev.length;i++)addEventListener(ev[i],finish,{capture:true,passive:true})})();`;
export const openingFlightScript = flightSource.replace(/\n/g, "");
