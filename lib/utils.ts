/** Junta nomes de classe, ignorando valores vazios (usado pelos ícones do lucide-animated). */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}
