import type { StaticImageData } from "next/image";
import hospital from "@/assets/logos/hospital-napoleao-laureano.png";
import ifpb from "@/assets/logos/ifpb.png";
import techeduconnect from "@/assets/logos/techeduconnect.svg";

type OrgLogo = { src: StaticImageData; height: number; colored?: true };

/**
 * Logos das instituições de Experiência e Formação (irmão de `stack-logos.ts`, que serve à stack).
 * Para adicionar um: pôr o arquivo em `assets/logos/`, o id em `OrgLogoId` e uma linha aqui.
 * A largura é sempre `--entry-logo`; `height` é a proporção do arquivo. Sem fundo nem selo: no tema escuro o logo é invertido (ver globals.css).
 * `colored: true`: o logo já é legível sobre o `--bg` escuro (o verde do Hospital) e não inverte.
 */
export type OrgLogoId = "techeduconnect" | "ifpb" | "hospital";

export const orgLogos: Record<OrgLogoId, OrgLogo> = {
  techeduconnect: { src: techeduconnect, height: 28 },
  ifpb: { src: ifpb, height: 44 },
  // Símbolo recortado do logo oficial do site do hospital (fonte em DESIGN.md).
  hospital: { src: hospital, height: 37, colored: true },
};
