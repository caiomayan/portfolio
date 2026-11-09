import { fallbackIcons, type FallbackIconId } from "@/lib/fallback-icons";

/** Ícone de reserva decorativo (o texto ao lado já diz tudo); `size` em px, cor `--soft` pelo CSS. */
export function FallbackIcon({ id, size, className }: { id: FallbackIconId; size: number; className?: string }) {
  const Icon = fallbackIcons[id];
  return <Icon className={className ? `fallback-icon ${className}` : "fallback-icon"} size={size} strokeWidth={1.75} aria-hidden="true" focusable="false" />;
}
