import { fallbackIcons, type FallbackIconId } from "@/lib/fallback-icons";

/** Ícone de reserva decorativo (o texto ao lado já diz tudo). Tamanho pelos tokens `--icon-*` no CSS; cor `--soft`. */
export function FallbackIcon({ id, className }: { id: FallbackIconId; className?: string }) {
  const Icon = fallbackIcons[id];
  return <Icon className={className ? `fallback-icon ${className}` : "fallback-icon"} strokeWidth={1.75} aria-hidden="true" focusable="false" />;
}
