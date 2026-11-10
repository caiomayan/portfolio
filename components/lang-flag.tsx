import { BR, US } from "country-flag-icons/react/3x2";
import type { Content } from "@/content";

// Bandeiras do country-flag-icons (MIT, SVG): só as duas usadas entram no bundle. Decorativa: o nome do link é a língua.
const flags = { US, BR };

export function LangFlag({ code }: { code: Content["ui"]["otherLang"]["flag"] }) {
  const Flag = flags[code];
  return <Flag className="lang-flag" data-flag={code} aria-hidden="true" focusable="false" />;
}
