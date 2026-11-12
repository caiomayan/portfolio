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
    /** Frase de abertura (#38); título + frase formam a descrição da página e a prévia. */
    lead: string;
    /** Trecho da frase de abertura que recebe o brilho (#39, rodada 4): tem que aparecer exatamente uma vez em `lead`. O texto da página não muda. */
    leadShine: string;
    /** Lugar ao lado do mapa compacto (#29, #38): cidade, hora (o relógio) e clima em três linhas. */
    place: { city: string };
    photoAlt: string;
  };
  /** Ícones de contato na faixa da primeira tela (#38): e-mail, LinkedIn, GitHub e currículo. O rótulo de cada um é o tooltip e o nome acessível (o do e-mail é o endereço). */
  contact: {
    /** Nome acessível do grupo de ícones. */
    label: string;
    email: ContactLink;
    linkedin: ContactLink;
    github: ContactLink;
    /** `null` quando não há PDF nessa língua: o link não aparece. */
    resume: ContactLink | null;
  };
  /** Clima ao lado da hora (#28, na primeira tela): nome de cada tempo (lido por leitor de tela) e o crédito do Open-Meteo (CC BY 4.0). */
  weather: { labels: Record<WeatherKind, string>; credit: { label: string; href: string } };
  /** Seção Idiomas (#38): o que ele fala. `sub`: subnível no estilo da monitoria do curso. */
  languages: { heading: string; items: { name: string; level: string; sub?: string }[] };
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
  /** Recado no console do navegador (#46): uma frase curta; o link do repositório (`REPO_URL`) vem logo depois, na mesma mensagem. */
  console: { message: string };
  ui: {
    themeToggle: string;
    /** Seletor de idioma (#38): nome acessível do botão do globo e do menu. Os nomes das línguas ficam em `locales` (cada uma na própria língua). */
    language: string;
  };
  /** Gráfico de contribuições do GitHub (#28). `total`: `one` com 1, `other` nos demais; `{n}` vira o número. */
  activity: { heading: string; total: { one: string; other: string } };
  /** Fundamentos: o que ele sabe de base, só texto, em três grupos, na ordem do copy deck. */
  foundations: { heading: string; groups: { label: string; items: { name: string; detail?: string }[] }[] };
  /** Rodapé mínimo (#29): `{year}` vira o ano corrente, calculado ao gerar a página. O crédito do clima (Open-Meteo, CC BY 4.0) é o link da temperatura na primeira tela (`weather.credit`), não o rodapé. */
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
