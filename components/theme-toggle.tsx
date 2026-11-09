"use client";

import { useRef, useSyncExternalStore } from "react";
import { prefersReducedMotion } from "@/lib/motion";
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
  const sun = useRef<{ startAnimation: () => void; stopAnimation: () => void }>(null);
  const moon = useRef<{ startAnimation: () => void; stopAnimation: () => void }>(null);

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

  const play = () => {
    if (prefersReducedMotion()) return;
    (dark ? sun : moon).current?.startAnimation();
  };
  const stop = () => {
    sun.current?.stopAnimation();
    moon.current?.stopAnimation();
  };

  return (
    <button
      type="button"
      className="theme-toggle"
      aria-pressed={dark}
      aria-label={label}
      onClick={toggle}
      onPointerEnter={play}
      onPointerLeave={stop}
      onFocus={play}
      onBlur={stop}
    >
      <SunIcon ref={sun} className="icon-sun" size={20} />
      <MoonIcon ref={moon} className="icon-moon" size={20} />
    </button>
  );
}
