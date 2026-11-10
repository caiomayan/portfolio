import type { Lang } from "@/lib/locales";
import type { OrgLogoId } from "@/lib/org-logos";
import type { FallbackIconId } from "@/lib/fallback-icons";
import type { StackLogoId } from "@/lib/stack-logos";
import type { WeatherKind } from "@/lib/weather";

/** `external`: abre em outra aba (sai do site). */
export type ContactLink = { label: string; href: string; external?: boolean };

/** Todo item tem um logo OU um ícone de reserva (Lucide), nunca nenhum dos dois. */
export type Mark<Logo extends string> = { logo: Logo; icon?: never } | { logo?: never; icon: FallbackIconId };

/** Linha de ícones com rótulo ("Feito com", "No curso"): o nome de cada um é o tooltip e o nome acessível. */
export type IconList = { label: string; items: ({ name: string } & Mark<StackLogoId>)[] };

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
    /** Lugar embaixo da frase de abertura (#29): cidade ao lado do mapa compacto e fuso da hora local (a hora em si vem do relógio). */
    place: { city: string; offset: string };
    photoAlt: string;
  };
  contact: {
    heading: string;
    email: string;
    /** Nome acessível do botão de copiar (só ícone). */
    copyEmail: string;
    /** Confirmação anunciada por leitor de tela depois de copiar. */
    copied: string;
    /** Falha ao copiar: anunciada pela região de status e mostrada discreta; o e-mail fica selecionado. */
    copyFailed: string;
    linkedin: ContactLink;
    github: ContactLink;
    /** `null` quando não há PDF nessa língua: o link não aparece. */
    resume: ContactLink | null;
    /** Clima ao lado da hora (#28, na primeira tela desde a #29): nome de cada tempo (lido por leitor de tela) e o crédito do Open-Meteo (CC BY 4.0). */
    weather: { labels: Record<WeatherKind, string>; credit: { prefix: string; name: string; href: string } };
    /** Línguas que ele fala: grupo pequeno com rótulo, uma linha por língua (bandeira e nome à esquerda, nível à direita). */
    languages: { heading: string; items: { name: string; level: string; flag: "BR" | "US" }[] };
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
      stack?: IconList;
    })[];
  };
  education: {
    heading: string;
    items: (EntryBase & {
      title: string;
      /** Segunda linha, mais discreta. */
      detail?: string;
      /** Descrição curta embaixo (o que o curso construiu). */
      description?: string;
      /** Subitens subordinados ao curso: rótulo curto ("Monitoria") antes do título, ícone de hierarquia e período próprio. */
      children?: { label: string; title: string; period: string }[];
      /** Ferramentas do curso, em linha de ícones abaixo da descrição. */
      stack?: IconList;
    })[];
  };
  ui: {
    themeToggle: string;
    /** Língua da página atual no seletor (#29): bandeira em destaque, `aria-current="page"`, não é link. O nome vai só pra leitor de tela. */
    currentLang: { label: string; lang: Lang; flag: "US" | "BR"; country: string };
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
  /** Fundamentos: o que ele sabe de base, só texto, em três grupos, na ordem do copy deck. */
  foundations: { heading: string; groups: { label: string; items: { name: string; detail?: string }[] }[] };
  /** Rodapé mínimo (#29): `{year}` vira o ano corrente, calculado ao gerar a página. O crédito do clima fica em `contact.weather.credit`. */
  footer: { copyright: string };
  carmine: {
    heading: string;
    note: string;
    name: string;
    what: string;
    status: string;
    how: string;
    stack: IconList;
    links: { site: { label: string; href: string }; repo: { label: string; href: string } };
  };
};

export type { Lang };
