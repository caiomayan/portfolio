"use client";

import { useEffect, useRef, useState } from "react";
import type { Content } from "@/content";
import type { ContactLink } from "@/content/types";
import { useIconHover, type IconComponent, type IconHandle } from "@/lib/icon-hover";
import { prefersReducedMotion } from "@/lib/motion";
import { Tooltip } from "./tooltip";
import { CheckIcon } from "./icons/check";
import { CopyIcon } from "./icons/copy";
import { FileTextIcon } from "./icons/file-text";
import { GithubIcon } from "./icons/github";
import { LinkedinIcon } from "./icons/linkedin";

function IconLink({ Icon, label, href, external }: { Icon: IconComponent } & ContactLink) {
  const ref = useRef<IconHandle>(null);
  const { play, handlers } = useIconHover([ref]);
  return (
    <Tooltip label={label}>
      <a
        className="contact-link"
        href={href}
        aria-label={label}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        {...handlers}
        onClick={play}
      >
        <Icon ref={ref} className="icon" />
      </a>
    </Tooltip>
  );
}

/** Copia o e-mail. Se a área de transferência falhar, avisa (mesma região de status) e seleciona o texto do e-mail, pra copiar à mão. */
function CopyButton({ text, label, doneLabel, failedLabel, source }: { text: string; label: string; doneLabel: string; failedLabel: string; source: React.RefObject<HTMLElement | null> }) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);
  const copy = useRef<IconHandle>(null);
  const check = useRef<IconHandle>(null);
  const { play, handlers } = useIconHover([copy]);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);
  // O ícone de confirmado desenha o traço assim que entra.
  useEffect(() => {
    if (copied && !prefersReducedMotion()) check.current?.startAnimation();
  }, [copied]);

  async function onClick() {
    play(); // o clique anima já, antes da confirmação
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Sem permissão ou sem clipboard: não finge que copiou. Avisa e deixa o e-mail selecionado.
      setCopied(false);
      setFailed(true);
      const el = source.current;
      if (el) window.getSelection()?.selectAllChildren(el);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setFailed(false), 6000);
      return;
    }
    setFailed(false);
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 2000);
  }

  return (
    <>
      <button
        type="button"
        className="copy-button"
        aria-label={label}
        data-copied={copied}
        onClick={onClick}
        {...handlers}
      >
        {copied ? <CheckIcon ref={check} /> : <CopyIcon ref={copy} />}
      </button>
      {/* Região sempre presente: o leitor de tela anuncia a troca de texto. A falha também aparece, discreta, na tela. */}
      <span role="status" className={failed ? "copy-note" : "sr-only"}>
        {failed ? failedLabel : copied ? doneLabel : ""}
      </span>
    </>
  );
}

/** `children`: blocos de servidor (as línguas, com bandeira) que entram no fim do Contato sem puxar a biblioteca de bandeiras pro cliente. */
export function Contact({ content, children }: { content: Content; children?: React.ReactNode }) {
  const c = content.contact;
  const address = useRef<HTMLAnchorElement>(null);
  return (
    <section className="contact" aria-labelledby="contato">
      <h2 id="contato" data-reveal-part>{c.heading}</h2>
      <div className="mail" data-reveal-part>
        <a ref={address} className="mail-address" href={`mailto:${c.email}`}>
          {c.email}
        </a>
        <CopyButton text={c.email} label={c.copyEmail} doneLabel={c.copied} failedLabel={c.copyFailed} source={address} />
      </div>
      <ul className="contact-links" data-reveal-part>
        <li>
          <IconLink Icon={LinkedinIcon} {...c.linkedin} />
        </li>
        <li>
          <IconLink Icon={GithubIcon} {...c.github} />
        </li>
        {c.resume && (
          <li>
            <IconLink Icon={FileTextIcon} {...c.resume} />
          </li>
        )}
      </ul>
      {children}
    </section>
  );
}
