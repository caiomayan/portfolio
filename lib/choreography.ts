/**
 * Coreografia das seções (#39): GSAP + ScrollTrigger, carregados com `import()` só depois da abertura e do primeiro momento ocioso
 * (components/choreography.tsx), então não entram no primeiro carregamento nem no LCP.
 *
 * Duas famílias, a mesma linguagem (sobe de baixo com opacity, ease suave, nada brusco):
 *  - **Presa à rolagem (scrub, com suavização)**: o progresso da rolagem conduz a entrada enquanto o elemento sobe da borda de baixo até ~45–60 % da
 *    altura da tela. Ao chegar lá a animação **assenta**: é encerrada, os estilos inline saem (`clearProps`) e o gatilho é morto. Depois disso nada
 *    se mexe (nem ao voltar a rolar pra cima, nem enquanto se lê). Sem pinning e sem deslocamento contínuo.
 *  - **Entrada única**: toca uma vez quando o bloco aparece (ícones em cascata etc.).
 * Só `opacity` e `transform` (`y`, `yPercent`, `scale`, `scaleY`). O estado escondido é aplicado aqui, no cliente, e só no que está inteiro abaixo
 * da tela no momento do preparo; se o script falhar, nada chegou a ser escondido. Um vigia independente do GSAP (um intervalo) força o estado final
 * de qualquer parte que devia ter terminado e não terminou. Com `prefers-reduced-motion`, nada é preparado.
 * Cada gatilho leva `data-motion="pending" | "played"` (os testes esperam por isso). `clamp()` nos limites: no fim da página nada fica pela metade.
 */
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { onLenisScroll } from "./scroll-bus";

const CLEAR = "opacity,transform,transformOrigin";
const WATCH_MS = 700;
const WATCH_STRIKES = 2; // ≈ 1,4 s além da hora em que devia ter terminado

type Item = { trigger: Element; tween: gsap.core.Tween; once: boolean; strikes: number; done: boolean; targets: gsap.TweenTarget };
type Mode = { desktop: boolean; wide: boolean };
type Range = { start?: string; end?: string };

const $ = (sel: string, root: ParentNode = document) => Array.from(root.querySelectorAll<HTMLElement>(sel));
const below = (el: Element) => el.getBoundingClientRect().top >= window.innerHeight * 0.985; // inteiro abaixo da tela

/** Prepara a coreografia e devolve o desmonte (usado na troca de idioma e se algo der errado). */
export function arm(): () => void {
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
  const items: Item[] = [];
  const root = document.documentElement;

  const settle = (it: Item) => {
    if (it.done) return;
    it.done = true;
    it.tween.scrollTrigger?.kill();
    it.tween.kill();
    gsap.set(it.targets, { clearProps: CLEAR });
    (it.trigger as HTMLElement).dataset.motion = "played";
  };

  /** Presa à rolagem, com suavização; assenta no fim. */
  const scrub = (targets: gsap.TweenTarget | null | undefined, from: gsap.TweenVars, to: gsap.TweenVars, trigger: Element | null | undefined, m: Mode, range?: Range) => {
    if (!targets || !trigger || !below(trigger)) return;
    const start = range?.start ?? (m.desktop ? "clamp(top 94%)" : "clamp(top 97%)");
    const end = range?.end ?? (m.desktop ? "clamp(top 55%)" : "clamp(top 75%)");
    (trigger as HTMLElement).dataset.motion = "pending";
    const it: Item = { trigger, once: false, strikes: 0, done: false, targets, tween: null as unknown as gsap.core.Tween };
    gsap.set(targets, from); // com stagger o GSAP só esconderia o primeiro alvo: o estado de partida de todos é posto aqui, de uma vez
    it.tween = gsap.fromTo(targets, from, {
      ...to,
      ease: "power2.out",
      scrollTrigger: { trigger, start, end, scrub: m.desktop ? 0.8 : 0.35, invalidateOnRefresh: true },
      onComplete: () => settle(it),
    });
    items.push(it);
  };

  /** Entrada única: toca uma vez, quando o gatilho aparece. */
  const enter = (targets: gsap.TweenTarget | null | undefined, trigger: Element | null | undefined, m: Mode, vars: { y?: number; stagger?: number; start?: string; duration?: number } = {}) => {
    if (!targets || !trigger || !below(trigger)) return;
    (trigger as HTMLElement).dataset.motion = "pending";
    const it: Item = { trigger, once: true, strikes: 0, done: false, targets, tween: null as unknown as gsap.core.Tween };
    const y = m.desktop ? (vars.y ?? 14) : Math.min(vars.y ?? 14, 10);
    gsap.set(targets, { opacity: 0, y }); // idem: todos os alvos escondidos desde já
    it.tween = gsap.to(targets, {
      opacity: 1,
      y: 0,
      duration: vars.duration ?? 0.7,
      ease: "power3.out",
      stagger: vars.stagger ?? 0.05,
      scrollTrigger: { trigger, start: vars.start ?? "clamp(top 86%)", once: true },
      onComplete: () => settle(it),
    });
    items.push(it);
  };

  const dy = (m: Mode, desktop = 36) => (m.desktop ? desktop : Math.round(desktop * 0.4)); // no celular o deslocamento é bem menor
  const titleRange = (m: Mode): Range => ({ end: m.desktop ? "clamp(top 60%)" : "clamp(top 80%)" });
  const titles = (section: Element | null, m: Mode) => {
    const h2 = section?.querySelector("h2");
    if (h2) scrub(h2.querySelector(".title-text"), { yPercent: 110 }, { yPercent: 0 }, h2, m, titleRange(m));
  };
  const line = (sec: Element | null, m: Mode) => {
    const wrap = sec?.querySelector(".timeline-wrap");
    scrub(wrap?.querySelector(".timeline"), { scaleY: 0 }, { scaleY: 1 }, wrap, m, {
      start: m.desktop ? "clamp(top 80%)" : "clamp(top 92%)",
      end: m.desktop ? "clamp(bottom 60%)" : "clamp(bottom 80%)",
    });
  };

  const mm = gsap.matchMedia();
  try {
  mm.add(
    { always: "(min-width: 1px)", desktop: "(hover: hover) and (pointer: fine)", wide: "(min-width: 900px)", reduce: "(prefers-reduced-motion: reduce)" },
    (ctx) => {
      const c = ctx.conditions as { desktop: boolean; wide: boolean; reduce: boolean };
      if (c.reduce) return;
      const m: Mode = { desktop: c.desktop, wide: c.wide };

      // Carmine: título por máscara; o bloco cresce de leve (scale .94 → 1) até assentar; ícones em cascata (única).
      const carmine = document.getElementById("carmine");
      const head = carmine?.querySelector(".carmine-head");
      if (head) {
        scrub(head.querySelector(".title-text"), { yPercent: 110 }, { yPercent: 0 }, head, m, titleRange(m));
        scrub([head.querySelector("img"), head.querySelector(".carmine-note")].filter(Boolean), { opacity: 0, y: dy(m, 16) }, { opacity: 1, y: 0 }, head, m);
      }
      const body = carmine?.querySelector(".carmine-body");
      scrub(body, { opacity: 0, y: dy(m, 28), scale: m.desktop ? 0.94 : 0.975, transformOrigin: "0% 0%" }, { opacity: 1, y: 0, scale: 1 }, body, m);
      if (carmine) enter($("li", carmine.querySelector(".stack") ?? carmine), carmine.querySelector(".icon-row"), m, { start: "clamp(top 66%)", stagger: 0.05, y: 12 });

      // Experiência: título por máscara; o fio de tempo se desenha ao lado das entradas; cada linha sobe presa à rolagem; ícones em cascata (única).
      const exp = document.getElementById("experiencia");
      titles(exp, m);
      line(exp, m);
      if (exp) {
        $(".entry", exp).forEach((row) => {
          scrub(row, { opacity: 0, y: dy(m, 28) }, { opacity: 1, y: 0 }, row, m);
          enter($(".stack li", row), row.querySelector(".icon-row"), m, { start: "clamp(top 78%)", y: 10 });
        });
      }

      // Formação: título; fio; cada linha entra em partes, uma depois da outra (texto, período, corpo), presa à rolagem; subitens em cascata (única).
      const edu = document.getElementById("formacao");
      titles(edu, m);
      line(edu, m);
      if (edu) {
        $(".entry", edu).forEach((row) => {
          const parts = [".entry-main", ".entry-period", ".entry-body", ".entry-children"].map((s) => row.querySelector(s)).filter(Boolean) as Element[];
          scrub(parts, { opacity: 0, y: dy(m, 24) }, { opacity: 1, y: 0, stagger: 0.25 }, row, m);
          enter($(".entry-child", row), row.querySelector(".entry-children"), m, { start: "clamp(top 80%)", stagger: 0.12, y: 10 });
          enter($(".stack li", row), row.querySelector(".icon-row"), m, { start: "clamp(top 80%)", y: 10 });
        });
      }

      // Fundamentos: título; as colunas sobem em sequência presas à rolagem (no celular, empilhadas: cada uma no seu tempo); itens em cascata (única).
      const fun = document.getElementById("fundamentos");
      titles(fun, m);
      const groups = fun ? $(".foundation-group", fun) : [];
      if (m.wide) scrub(groups, { opacity: 0, y: dy(m, 40) }, { opacity: 1, y: 0, stagger: 0.3 }, fun?.querySelector(".foundations"), m);
      else groups.forEach((g) => scrub(g, { opacity: 0, y: dy(m, 28) }, { opacity: 1, y: 0 }, g, m));
      groups.forEach((g) => enter($("li", g), g, m, { start: m.wide ? "clamp(top 62%)" : "clamp(top 82%)", stagger: 0.06, y: 10 }));

      // Atividade: título; o total sobe; a grade acende em onda, semana a semana, presa à rolagem (no celular, a partir do lado visível: as semanas recentes).
      const act = document.querySelector(".activity");
      titles(act, m);
      const total = act?.querySelector(".activity-total");
      scrub(total, { opacity: 0, y: dy(m, 16) }, { opacity: 1, y: 0 }, total, m);
      scrub(act ? $(".activity-week", act) : [], { opacity: 0 }, { opacity: 1, stagger: { each: 0.02, from: m.desktop ? "start" : "end" } }, act?.querySelector(".activity-scroll"), m, {
        start: m.desktop ? "clamp(top 92%)" : "clamp(top 97%)",
        end: m.desktop ? "clamp(top 45%)" : "clamp(top 70%)",
      });

      // Idiomas: título; as linhas entram em cascata (única).
      const lang = document.getElementById("idiomas");
      titles(lang, m);
      enter(lang ? $(".language", lang) : [], lang?.querySelector(".languages"), m, { stagger: 0.09, y: 16 });

      // Rodapé: sobe uma vez, assim que aparece.
      const footer = document.querySelector(".site-footer");
      enter(footer ? [footer] : [], footer, m, { start: "clamp(top bottom)", y: 12, duration: 0.8 });
    },
  );
  } catch (e) {
    mm.revert(); // falhou no meio: devolve tudo o que já tinha sido escondido
    items.forEach((it) => {
      it.tween.kill();
      gsap.set(it.targets, { clearProps: CLEAR });
      delete (it.trigger as HTMLElement).dataset.motion;
    });
    throw e;
  }

  // O Lenis (desktop) atualiza o ScrollTrigger no mesmo quadro; sem ele a rolagem nativa já dispara os eventos.
  const offLenis = onLenisScroll(() => ScrollTrigger.update());
  // Sem refresh próprio: o ScrollTrigger já recalcula nos eventos load, resize e visibilitychange. Um `refresh()` nosso (por exemplo num ResizeObserver)
  // levava a rolagem a 0 e a devolvia no meio de uma rolagem do Lenis, e a página voltava ao topo.

  // Vigia (não depende do GSAP): o que devia ter terminado e não terminou (ticker parado, erro) vai direto ao estado final.
  const watch = window.setInterval(() => {
    const scrollY = window.scrollY;
    for (const it of items) {
      if (it.done) continue;
      const st = it.tween.scrollTrigger;
      const atBottom = scrollY >= root.scrollHeight - window.innerHeight - 4; // no fim da página nada fica pra depois
      const reached = atBottom || (st ? (it.once ? scrollY >= st.start - 1 : scrollY >= st.end - 1) : false);
      it.strikes = reached ? it.strikes + 1 : 0;
      if (it.strikes >= WATCH_STRIKES + (it.once ? 2 : 0)) settle(it);
    }
  }, WATCH_MS);

  root.dataset.choreography = "armed";
  return () => {
    clearInterval(watch);
    offLenis();
    mm.kill(); // para de ouvir as media queries; os gatilhos e as animações são mortos um a um abaixo (sem `revert()`: ele refaz o cálculo dos gatilhos e mexia na rolagem)
    // A troca de idioma reaproveita nós do DOM: nenhuma parte ainda não tocada pode ficar com estilo inline de animação.
    items.forEach((it) => {
      it.tween.scrollTrigger?.kill();
      it.tween.kill();
      gsap.set(it.targets, { clearProps: CLEAR });
      delete (it.trigger as HTMLElement).dataset.motion;
    });
    delete root.dataset.choreography;
  };
}
