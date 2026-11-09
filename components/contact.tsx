"use client";

import { useEffect, useRef, useState, type ComponentType, type Ref, type RefObject } from "react";
import type { Content } from "@/content";
import { prefersReducedMotion } from "@/lib/motion";
import { CheckIcon } from "./icons/check";
import { CopyIcon } from "./icons/copy";
import { FileTextIcon } from "./icons/file-text";
import { GithubIcon } from "./icons/github";
import { LinkedinIcon } from "./icons/linkedin";

type IconHandle = { startAnimation: () => void; stopAnimation: () => void };
type IconComponent = ComponentType<{ size?: number; className?: string; ref?: Ref<IconHandle> }>;

type IconRef = RefObject<IconHandle | null>;

/** Anima o ícone no hover, no foco e no clique; parado com prefers-reduced-motion. */
function play(ref: IconRef) {
  if (!prefersReducedMotion()) ref.current?.startAnimation();
}
function stop(ref: IconRef) {
  ref.current?.stopAnimation();
}

function IconLink({ Icon, label, href }: { Icon: IconComponent; label: string; href: string }) {
  const ref = useRef<IconHandle>(null);
  const external = href.startsWith("http");
  return (
    <a
      className="contact-link"
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      onPointerEnter={() => play(ref)}
      onPointerLeave={() => stop(ref)}
      onFocus={() => play(ref)}
      onBlur={() => stop(ref)}
      onClick={() => play(ref)}
    >
      <Icon ref={ref} className="icon" size={20} />
      <span>{label}</span>
    </a>
  );
}

function CopyButton({ text, label, doneLabel }: { text: string; label: string; doneLabel: string }) {
  const [copied, setCopied] = useState(false);
  const copy = useRef<IconHandle>(null);
  const check = useRef<IconHandle>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);
  // O ícone de confirmado desenha o traço assim que entra.
  useEffect(() => {
    if (copied && !prefersReducedMotion()) check.current?.startAnimation();
  }, [copied]);

  async function onClick() {
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
        onPointerEnter={() => play(copy)}
        onPointerLeave={() => stop(copy)}
        onFocus={() => play(copy)}
        onBlur={() => stop(copy)}
      >
        {copied ? <CheckIcon ref={check} size={20} /> : <CopyIcon ref={copy} size={20} />}
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
      <h2 id="contato">{c.heading}</h2>
      <div className="mail">
        <a className="mail-address" href={`mailto:${c.email}`}>
          {c.email}
        </a>
        <CopyButton text={c.email} label={c.copyEmail} doneLabel={c.copied} />
      </div>
      <ul className="contact-links">
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
