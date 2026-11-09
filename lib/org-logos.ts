import type { StaticImageData } from "next/image";
import ifpb from "@/assets/logos/ifpb.png";
import techeduconnect from "@/assets/logos/techeduconnect.svg";

type OrgLogo = { src: StaticImageData; height: number };

/**
 * Logos das instituições de Experiência e Formação (irmão de `stack-logos.ts`, que serve à stack).
 * Para adicionar um: pôr o arquivo em `assets/logos/`, o id em `OrgLogoId` e uma linha aqui.
 * A largura é sempre `--entry-logo`; `height` é a proporção do arquivo. Sem fundo nem selo: no tema escuro o logo é invertido (ver globals.css).
 */
export type OrgLogoId = "techeduconnect" | "ifpb";

export const orgLogos: Record<OrgLogoId, OrgLogo> = {
  techeduconnect: { src: techeduconnect, height: 40 },
  ifpb: { src: ifpb, height: 44 },
};
