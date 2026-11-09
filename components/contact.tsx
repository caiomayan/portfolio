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

function CopyButton({ text, label, doneLabel }: { text: string; label: string; doneLabel: string }) {
  const [copied, setCopied] = useState(false);
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
      return; // sem permissão ou sem clipboard: não finge que copiou
    }
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
      {/* Região sempre presente: o leitor de tela anuncia a troca de texto. */}
      <span role="status" className="sr-only">
        {copied ? doneLabel : ""}
      </span>
    </>
  );
}

export function Contact({ content }: { content: Content }) {
  const c = content.contact;
  return (
    <section className="contact" aria-labelledby="contato">
      <h2 id="contato" data-reveal-part>{c.heading}</h2>
      <div className="mail" data-reveal-part>
        <a className="mail-address" href={`mailto:${c.email}`}>
          {c.email}
        </a>
        <CopyButton text={c.email} label={c.copyEmail} doneLabel={c.copied} />
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
    </section>
  );
}
