import type { ComponentType, Ref, RefObject } from "react";
import { prefersReducedMotion } from "./motion";

/** O que os ícones do lucide-animated expõem por ref. */
export type IconHandle = { startAnimation: () => void; stopAnimation: () => void };
export type IconComponent = ComponentType<{ size?: number; className?: string; ref?: Ref<IconHandle> }>;
type IconRef = RefObject<IconHandle | null>;

/**
 * Anima o ícone no hover e no foco; parado com prefers-reduced-motion (lido no evento, não na renderização).
 * `active` escolhe qual ícone toca (padrão: todos); `stop` para todos.
 */
export function useIconHover(refs: IconRef[], active?: () => IconRef) {
  const play = () => {
    if (prefersReducedMotion()) return;
    if (active) active().current?.startAnimation();
    else refs.forEach((r) => r.current?.startAnimation());
  };
  const stop = () => refs.forEach((r) => r.current?.stopAnimation());
  return {
    play,
    handlers: { onPointerEnter: play, onPointerLeave: stop, onFocus: play, onBlur: stop },
  };
}
