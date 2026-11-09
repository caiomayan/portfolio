/** `external`: abre em outra aba (sai do site). */
export type ContactLink = { label: string; href: string; external?: boolean };

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
  ui: {
    themeToggle: string;
  };
};

export type Lang = "pt" | "en";
