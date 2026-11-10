import type { Lang } from "@/lib/locales";
import type { OrgLogoId } from "@/lib/org-logos";
import type { FallbackIconId } from "@/lib/fallback-icons";
import type { StackLogoId } from "@/lib/stack-logos";
import type { WeatherKind } from "@/lib/weather";

/** `external`: abre em outra aba (sai do site). */
export type ContactLink = { label: string; href: string; external?: boolean };

/** Todo item tem um logo OU um ícone de reserva (Lucide), nunca nenhum dos dois. */
export type Mark<Logo extends string> = { logo: Logo; icon?: never } | { logo?: never; icon: FallbackIconId };

/** O que Experiência e Formação têm em comum: uma linha com período e logo ou ícone de reserva. */
export type EntryBase = { period: string } & Mark<OrgLogoId>;

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
    /** Linha discreta embaixo da frase de abertura. */
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
    /** Cidade ao lado do mapa e fuso da hora local (a hora em si vem do relógio, não daqui). */
    map: { place: string; offset: string };
    /** Clima ao lado da hora (#28): nome de cada tempo (lido por leitor de tela) e o crédito do Open-Meteo (CC BY 4.0). */
    weather: { labels: Record<WeatherKind, string>; credit: { prefix: string; name: string; href: string } };
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
    otherLang: {
      label: string;
      href: string;
      lang: Lang;
      /** Bandeira do país da língua de destino (a única cor da barra do topo) e o nome dele, que é o tooltip. */
      flag: "US" | "BR";
      country: string;
    };
  };
  /** Gráfico de contribuições do GitHub (#28). `total`: `one` com 1, `other` nos demais; `{n}` vira o número. */
  activity: { heading: string; total: { one: string; other: string } };
  carmine: {
    heading: string;
    note: string;
    name: string;
    what: string;
    status: string;
    how: string;
    stackLabel: string;
    stack: ({ name: string } & Mark<StackLogoId>)[];
    links: { site: { label: string; href: string }; repo: { label: string; href: string } };
  };
};

export type { Lang };
