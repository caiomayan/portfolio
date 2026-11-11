"use client";

import type { Variants } from "motion/react";
import { motion, useAnimation } from "motion/react";
import type { HTMLAttributes } from "react";
import { forwardRef, useCallback, useImperativeHandle, useRef } from "react";

import { cn } from "@/lib/utils";

export interface MailIconHandle {
  startAnimation: () => void;
  stopAnimation: () => void;
}

interface MailIconProps extends HTMLAttributes<HTMLDivElement> {
  size?: number;
}

// Mesmo padrão dos outros ícones de interface (lucide-animated): o envelope se desenha e a aba desce e volta.
const BODY_VARIANTS: Variants = {
  normal: { pathLength: 1, opacity: 1, transition: { duration: 0.3 } },
  animate: { pathLength: [0, 1], opacity: [0, 1], transition: { duration: 0.45 } },
};

const FLAP_VARIANTS: Variants = {
  normal: { pathLength: 1, y: 0, transition: { duration: 0.3 } },
  animate: { pathLength: [0, 1], y: [0, 1.5, 0], transition: { duration: 0.5 } },
};

const MailIcon = forwardRef<MailIconHandle, MailIconProps>(({ onMouseEnter, onMouseLeave, className, size = 28, ...props }, ref) => {
  const bodyControls = useAnimation();
  const flapControls = useAnimation();
  const isControlledRef = useRef(false);

  useImperativeHandle(ref, () => {
    isControlledRef.current = true;
    return {
      startAnimation: () => {
        bodyControls.start("animate");
        flapControls.start("animate");
      },
      stopAnimation: () => {
        bodyControls.start("normal");
        flapControls.start("normal");
      },
    };
  });

  const handleMouseEnter = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (isControlledRef.current) onMouseEnter?.(e);
      else {
        bodyControls.start("animate");
        flapControls.start("animate");
      }
    },
    [bodyControls, flapControls, onMouseEnter],
  );

  const handleMouseLeave = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (isControlledRef.current) onMouseLeave?.(e);
      else {
        bodyControls.start("normal");
        flapControls.start("normal");
      }
    },
    [bodyControls, flapControls, onMouseLeave],
  );

  return (
    <div className={cn(className)} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} {...props}>
      <svg
        fill="none"
        height={size}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
        width={size}
        xmlns="http://www.w3.org/2000/svg"
      >
        <motion.rect animate={bodyControls} height="16" initial="normal" rx="2" variants={BODY_VARIANTS} width="20" x="2" y="4" />
        <motion.path animate={flapControls} d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" initial="normal" variants={FLAP_VARIANTS} />
      </svg>
    </div>
  );
});

MailIcon.displayName = "MailIcon";

export { MailIcon };
