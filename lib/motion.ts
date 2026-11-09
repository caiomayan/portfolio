/** O visitante pediu menos movimento? Lido no momento do evento, nunca na renderização. */
export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Roda `update` dentro de uma View Transition (fade da página inteira, só composição).
 * Sem suporte do navegador ou com movimento reduzido, roda na hora, sem transição.
 */
export function withViewTransition(update: () => void): void {
  const start = (document as Document & { startViewTransition?: (callback: () => void) => unknown }).startViewTransition;
  if (start && !prefersReducedMotion()) start.call(document, update);
  else update();
}
