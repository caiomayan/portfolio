import { en } from "./en";
import { pt } from "./pt";
import type { Content, Lang } from "./types";

export type { Content, Lang };

export const content: Record<Lang, Content> = { pt, en };

/** Frase de abertura completa (título + lead), usada na descrição da página. */
export function openingLine(c: Content): string {
  return `${c.hero.title}. ${c.hero.lead}`;
}
