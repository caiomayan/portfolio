import { Puzzle, type LucideIcon } from "lucide-react";

/**
 * Ícones de reserva (Lucide) para o que não tem logo: plugin.
 * Todo item de stack, tecnologias, experiência e formação tem um logo OU um destes. Para adicionar: importar e uma linha aqui.
 */
export const fallbackIcons = {
  puzzle: Puzzle,
} satisfies Record<string, LucideIcon>;

export type FallbackIconId = keyof typeof fallbackIcons;
