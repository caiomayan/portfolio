"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { prefersReducedMotion } from "@/lib/motion";
import { Check, Globe } from "lucide-react";
import { langs, locales, type Lang } from "@/lib/locales";

/** Foco a devolver ao botão quando a troca de idioma remonta a página (a barra do topo é recriada junto com o conteúdo). */
let restoreFocus = false;

/** Resolve a View Transition da troca quando a página nova já está na tela (chamado pela barra do topo recriada). */
let settleTransition: (() => void) | null = null;

/**
 * Troca de idioma (#38): crossfade curto da página (View Transitions, só opacidade, até 200 ms; `:active-view-transition-type(lang)` em app/motion.css).
 * A transição só termina de capturar o "depois" quando o conteúdo novo chegou (`settleTransition`); sem suporte, ou com movimento reduzido, troca na hora.
 */
function navigateWithFade(go: () => void) {
  const doc = document as Document & { startViewTransition?: (options: { update: () => Promise<void>; types: string[] }) => unknown };
  if (!doc.startViewTransition || prefersReducedMotion()) return go();
  doc.startViewTransition({
    types: ["lang"], // `:active-view-transition-type(lang)` em app/motion.css
    update: () =>
      new Promise<void>((resolve) => {
        settleTransition = resolve;
        setTimeout(resolve, 1500); // se a rota demorar, a transição não fica presa
        go();
      }),
  });
}

/**
 * Seletor de idioma (#38): botão com o globo e a sigla da língua atual, que abre um menu pequeno com as três línguas, cada uma no próprio
 * nome, e um ✓ na atual. Botão com `aria-haspopup` e `aria-expanded`; setas (e Home/End) andam entre os itens, Esc fecha e devolve o foco
 * ao botão, clique fora fecha. Os itens são links de verdade (`href` e `hreflang`): navegam sem recarregar a página (o Next troca só o
 * conteúdo e a rolagem fica onde está) e, sem JavaScript, levam à rota da língua.
 */
export function LangMenu({ lang, label }: { lang: Lang; label: string }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const items = useRef<(HTMLAnchorElement | null)[]>([]);
  const menuId = useId();
  const router = useRouter();

  // A troca remonta este componente: o foco volta ao botão, que é onde o teclado estava.
  useEffect(() => {
    if (settleTransition) {
      const settle = settleTransition;
      settleTransition = null;
      setTimeout(settle, 0); // o conteúdo novo já está no DOM; a pintura é parada durante a transição, então não dá pra esperar um quadro
    }
    if (restoreFocus) {
      restoreFocus = false;
      button.current?.focus({ preventScroll: true }); // a rolagem fica onde estava
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  function openMenu(focus: "current" | "first" | "last" = "current") {
    setOpen(true);
    // O menu existe no DOM só depois da renderização: o foco entra no próximo quadro.
    requestAnimationFrame(() => {
      const i = focus === "first" ? 0 : focus === "last" ? langs.length - 1 : langs.indexOf(lang);
      items.current[i]?.focus();
    });
  }

  function close(returnFocus: boolean) {
    setOpen(false);
    if (returnFocus) button.current?.focus();
  }

  function onButtonKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      openMenu("first");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      openMenu("last");
    }
  }

  function onMenuKeyDown(e: React.KeyboardEvent) {
    const current = items.current.findIndex((el) => el === document.activeElement);
    const last = langs.length - 1;
    const next = { ArrowDown: current < last ? current + 1 : 0, ArrowUp: current > 0 ? current - 1 : last, Home: 0, End: last }[e.key];
    if (next !== undefined) {
      e.preventDefault();
      items.current[next]?.focus();
    } else if (e.key === "Escape") {
      e.preventDefault();
      close(true);
    } else if (e.key === "Tab") {
      setOpen(false);
    }
  }

  return (
    <div className="lang-menu" ref={root}>
      <button
        ref={button}
        type="button"
        className="lang-button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => (open ? close(false) : openMenu())}
        onKeyDown={onButtonKeyDown}
      >
        <Globe className="lang-button-icon" strokeWidth={1.75} aria-hidden="true" focusable="false" />
        {/* Nome acessível pelo conteúdo ("Idioma: PT"): o texto visível, a sigla, faz parte dele. */}
        <span className="sr-only">{label}: </span>
        {locales[lang].short}
      </button>
      {open && (
        <ul className="lang-list" id={menuId} role="menu" aria-label={label} onKeyDown={onMenuKeyDown}>
          {langs.map((l, i) => (
            <li key={l} role="none">
              <Link
                ref={(el) => {
                  items.current[i] = el;
                }}
                className="lang-item"
                href={locales[l].path}
                scroll={false}
                lang={locales[l].htmlLang}
                hrefLang={locales[l].hreflang}
                role="menuitemradio"
                aria-checked={l === lang}
                tabIndex={-1}
                onClick={(e) => {
                  setOpen(false);
                  if (l === lang) {
                    e.preventDefault();
                    return;
                  }
                  if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return; // abrir em outra aba segue o link normal
                  e.preventDefault();
                  restoreFocus = true;
                  navigateWithFade(() => router.push(locales[l].path, { scroll: false }));
                }}
              >
                <span>{locales[l].name}</span>
                {l === lang && <Check className="lang-item-check" strokeWidth={2} aria-hidden="true" focusable="false" />}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
