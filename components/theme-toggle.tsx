"use client";

import { useRef, useSyncExternalStore } from "react";
import { useIconHover, type IconHandle } from "@/lib/icon-hover";
import { MoonIcon } from "./icons/moon";
import { SunIcon } from "./icons/sun";

function subscribe(onChange: () => void) {
  const mo = new MutationObserver(onChange);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => mo.disconnect();
}
const isDark = () => document.documentElement.dataset.theme === "dark";

export function ThemeToggle({ label }: { label: string }) {
  const dark = useSyncExternalStore(subscribe, isDark, () => false);
  const sun = useRef<IconHandle>(null);
  const moon = useRef<IconHandle>(null);

  function toggle() {
    const next = dark ? "light" : "dark";
    // A transição de cor só existe depois do primeiro clique: no recarregamento não há fade (sem piscar).
    document.documentElement.classList.add("theme-ready");
    if (next === "dark") document.documentElement.dataset.theme = "dark";
    else delete document.documentElement.dataset.theme;
    try {
      localStorage.setItem("theme", next);
    } catch {}
  }

  const { handlers } = useIconHover([sun, moon], () => (dark ? sun : moon));

  return (
    <button
      type="button"
      className="theme-toggle"
      aria-pressed={dark}
      aria-label={label}
      onClick={toggle}
      {...handlers}
    >
      <SunIcon ref={sun} className="icon-sun" size={20} />
      <MoonIcon ref={moon} className="icon-moon" size={20} />
    </button>
  );
}
