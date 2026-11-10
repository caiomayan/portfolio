import { Puzzle, type LucideIcon } from "lucide-react";

/**
 * Ícones de reserva (Lucide) para o que não tem logo: plugin.
 * Todo item das linhas de ícones, de experiência e de formação tem um logo OU um destes. Para adicionar: importar e uma linha aqui.
 */
export const fallbackIcons = {
  puzzle: Puzzle,
} satisfies Record<string, LucideIcon>;

export type FallbackIconId = keyof typeof fallbackIcons;
