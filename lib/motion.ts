/** O visitante pediu menos movimento? Lido no momento do evento, nunca na renderização. */
export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
