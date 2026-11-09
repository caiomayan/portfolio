import type { OrgLogoId } from "@/lib/org-logos";
import type { StackLogoId } from "@/lib/stack-logos";

/** `external`: abre em outra aba (sai do site). */
export type ContactLink = { label: string; href: string; external?: boolean };

/** O que Experiência e Formação têm em comum: uma linha com período e, opcionalmente, o logo da instituição. */
export type EntryBase = { period: string; logo?: OrgLogoId };

/** Forma única do conteúdo: `pt` e `en` precisam satisfazer este tipo, ou o compilador acusa. */
export type Content = {
  meta: {
    /** Título da aba. */
    title: string;
  };
  hero: {
    name: string;
    /** Título profissional: é o h1 da página. */
    title: string;
    /** Resto da frase de abertura; título + lead formam a frase do copy deck. */
    lead: string;
    location: string;
    photoAlt: string;
  };
  contact: {
    heading: string;
    email: string;
    /** Nome acessível do botão de copiar (só ícone). */
    copyEmail: string;
    /** Confirmação anunciada por leitor de tela depois de copiar. */
    copied: string;
    linkedin: ContactLink;
    github: ContactLink;
    /** `null` quando não há PDF nessa língua: o link não aparece. */
    resume: ContactLink | null;
  };
  experience: {
    heading: string;
    jobs: (EntryBase & {
      company: string;
      /** Só a TechEduConnect tem; o Hospital fica só com o nome. */
      companyUrl?: string;
      role: string;
      about?: string;
      lines: string[];
    })[];
  };
  education: {
    heading: string;
    items: (EntryBase & {
      title: string;
      /** Segunda linha, mais discreta. */
      detail?: string;
    })[];
  };
  ui: {
    themeToggle: string;
    /** Link pra rota equivalente na outra língua: o texto está na língua de destino ("English" / "Português"). */
    otherLang: { label: string; href: string; lang: string };
  };
  carmine: {
    heading: string;
    note: string;
    name: string;
    what: string;
    status: string;
    how: string;
    shotsLabel: string;
    shots: { id: "inventario" | "ranking"; tab: string; alt: string }[];
    shotsCaption: string;
    stackLabel: string;
    stack: { name: string; role: string; logo: StackLogoId | null }[];
    links: { site: { label: string; href: string }; repo: { label: string; href: string } };
  };
};

export type Lang = "pt" | "en";
