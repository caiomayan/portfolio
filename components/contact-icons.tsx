"use client";

import { useRef } from "react";
import type { Content } from "@/content";
import type { ContactLink } from "@/content/types";
import { useIconHover, type IconComponent, type IconHandle } from "@/lib/icon-hover";
import { useRoving } from "@/lib/roving";
import { Tooltip } from "./tooltip";
import { FileTextIcon } from "./icons/file-text";
import { GithubIcon } from "./icons/github";
import { LinkedinIcon } from "./icons/linkedin";
import { MailIcon } from "./icons/mail";

/** Um ícone da linha: link de 44 px, nome acessível e tooltip = o rótulo, animado no hover e no foco. */
type Props = { Icon: IconComponent; last: boolean; setItem: (el: HTMLElement | null) => void; tabStop: number; onItemFocus: () => void } & ContactLink;

function IconLink({ Icon, label, href, external, last, setItem, tabStop, onItemFocus }: Props) {
  const ref = useRef<IconHandle>(null);
  const { play, handlers } = useIconHover([ref]);
  return (
    <Tooltip label={label} end={last}>
      <a
        ref={setItem}
        className="contact-link"
        href={href}
        aria-label={label}
        tabIndex={tabStop}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        {...handlers}
        onFocus={() => {
          handlers.onFocus();
          onItemFocus();
        }}
        onClick={play}
      >
        <Icon ref={ref} className="icon" />
      </a>
    </Tooltip>
  );
}

/**
 * Contato na faixa da primeira tela (#38), à direita: e-mail, LinkedIn, GitHub e Currículo (PDF), só ícones (alvos de 44 px).
 * O rótulo de cada um é o tooltip e o nome acessível (o do e-mail é o endereço). É a mesma linha de ícones do resto do site:
 * UMA parada de Tab e as setas (mais Home e End) andam entre os ícones (`lib/roving.ts`).
 */
export function ContactIcons({ contact }: { contact: Content["contact"] }) {
  const items: { key: string; Icon: IconComponent; link: ContactLink }[] = [
    { key: "email", Icon: MailIcon, link: contact.email },
    { key: "linkedin", Icon: LinkedinIcon, link: contact.linkedin },
    { key: "github", Icon: GithubIcon, link: contact.github },
    ...(contact.resume ? [{ key: "resume", Icon: FileTextIcon, link: contact.resume }] : []),
  ];
  const roving = useRoving(items.length);
  return (
    <ul className="contact-icons" aria-label={contact.label} onKeyDown={roving.onKeyDown}>
      {items.map((item, i) => (
        <li key={item.key}>
          <IconLink
            Icon={item.Icon}
            {...item.link}
            last={i === items.length - 1}
            setItem={roving.register(i)}
            tabStop={roving.tabIndex(i)}
            onItemFocus={() => roving.focusItem(i)}
          />
        </li>
      ))}
    </ul>
  );
}
