import type { Content } from "./types";

// Fonte do texto: docs/copy-deck.md
export const pt: Content = {
  meta: { title: "Caio Mayan — Engenheiro de Software" },
  hero: {
    name: "Caio Mayan",
    title: "Engenheiro de Software",
    lead: "Construo produtos com IA aplicada, sobre uma base sólida de backend.",
    location: "João Pessoa, Paraíba",
    photoAlt: "Retrato de Caio Mayan",
  },
  contact: {
    heading: "Contato",
    email: "mail@caiomayan.com",
    copyEmail: "Copiar e-mail",
    copied: "Copiado",
    linkedin: { label: "LinkedIn", href: "https://www.linkedin.com/in/caiomayan/", external: true },
    github: { label: "GitHub", href: "https://github.com/caiomayan", external: true },
    resume: { label: "Currículo (PDF)", href: "/caio-mayan-curriculo.pdf" },
  },
  ui: { themeToggle: "Tema escuro" },
  carmine: {
    heading: "Carmine",
    note: "Projeto pessoal",
    name: "Carmine",
    what: "SaaS para jogadores e times competitivos de Counter-Strike 2.",
    status: "Em desenvolvimento, lançamento previsto para 2027",
    how: "Desenvolvido com agentes de IA que abrem issues e pull requests e mantêm as specs e o backlog em dia, com homologação separada da produção.",
    shotsLabel: "Telas do Carmine",
    shots: [
      { id: "inventario", tab: "Inventário", alt: "Tela de Inventário do Carmine, com o catálogo de itens, em stcarmine.com" },
      { id: "ranking", tab: "Ranking", alt: "Tela de Ranking semanal do Carmine em stcarmine.com" },
    ],
    shotsCaption: "Capturas de stcarmine.com, no ar.",
    stackLabel: "Stack",
    stack: [
      { name: "Nest.js", role: "backend", logo: "nestjs" },
      { name: "Next.js", role: "frontend", logo: "nextdotjs" },
      { name: "Valkey", role: "cache e filas", logo: "valkey" },
      { name: "CounterStrikeSharp", role: "plugins dos servidores de CS2", logo: null },
      { name: "AWS EC2", role: "servidores de CS2 de teste", logo: "amazonec2" },
      { name: "Oracle Cloud", role: "servidor web, em máquina Ampere", logo: "oracle" },
    ],
    links: {
      site: { label: "stcarmine.com", href: "https://stcarmine.com" },
      repo: { label: "Repositório", href: "https://github.com/caiomayan/carmine" },
    },
  },
};
