import type { StaticImageData } from "next/image";
import amazonec2 from "@/assets/logos/amazonec2.svg";
import nestjs from "@/assets/logos/nestjs.svg";
import nextdotjs from "@/assets/logos/nextdotjs.svg";
import oracle from "@/assets/logos/oracle.svg";
import valkey from "@/assets/logos/valkey.svg";

type StackLogo = { src: StaticImageData; colored: boolean };

/**
 * Único lugar que conhece os logos da stack. Para adicionar um: pôr o SVG em `assets/logos/`
 * e uma linha aqui; o tipo `StackLogoId` (usado por `content/`) acompanha sozinho.
 * `colored: true` = logo colorida, que não inverte no tema escuro.
 */
export const stackLogos = {
  nestjs: { src: nestjs, colored: false },
  nextdotjs: { src: nextdotjs, colored: false },
  valkey: { src: valkey, colored: true },
  amazonec2: { src: amazonec2, colored: false },
  oracle: { src: oracle, colored: false },
} satisfies Record<string, StackLogo>;

export type StackLogoId = keyof typeof stackLogos;
