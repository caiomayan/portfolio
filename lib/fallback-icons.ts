import { GraduationCap, Hospital, Languages, Puzzle, type LucideIcon } from "lucide-react";

/**
 * Ícones de reserva (Lucide) para o que não tem logo: instituição, plugin, formação.
 * Todo item de stack, experiência e formação tem um logo OU um destes. Para adicionar: importar e uma linha aqui.
 */
export const fallbackIcons = {
  hospital: Hospital,
  puzzle: Puzzle,
  "graduation-cap": GraduationCap,
  languages: Languages,
} satisfies Record<string, LucideIcon>;

export type FallbackIconId = keyof typeof fallbackIcons;
