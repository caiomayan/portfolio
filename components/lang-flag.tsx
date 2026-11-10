import { BR, US } from "country-flag-icons/react/3x2";
import type { Content } from "@/content";

// Bandeiras do country-flag-icons (MIT, © 2020 @catamphetamine; SVG): só as duas usadas entram no bundle. Decorativa: o nome do link é a língua.
const flags = { US, BR };

export function LangFlag({ code, className }: { code: Content["ui"]["otherLang"]["flag"]; className?: string }) {
  const Flag = flags[code];
  return <Flag className={className ? `lang-flag ${className}` : "lang-flag"} data-flag={code} aria-hidden="true" focusable="false" />;
}
