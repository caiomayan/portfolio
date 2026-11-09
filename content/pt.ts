import { locales } from "@/lib/locales";
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
  experience: {
    heading: "Experiência",
    jobs: [
      {
        company: "TechEduConnect",
        logo: "techeduconnect",
        companyUrl: "https://www.techeduconnect.com.br/",
        role: "Estagiário de Engenharia de Software",
        period: "out. 2026 – atual · remoto",
        about:
          "Edtech especializada em Moodle (implantação, plugins, integrações e hospedagem) para instituições de ensino e empresas.",
        lines: [
          "Plugin de correção de redações com IA para Moodle, em produção numa instituição de ensino superior. A IA propõe a avaliação e o tutor revisa e aprova.",
          "Plataformas de ensino próprias em Next.js, React e TypeScript, e customizações e integrações para Moodle em PHP.",
          "Desenvolvo com agentes de código (Claude Code com skills), a partir de specs, testes e quality gates.",
        ],
      },
      {
        company: "Hospital Napoleão Laureano",
        role: "Jovem Aprendiz, setor de Compras",
        period: "mai. 2024 – mai. 2025 · João Pessoa",
        lines: [
          "Compras de EPIs, engenharia clínica e TI, contratos e fornecedores, num hospital especializado em oncologia.",
        ],
      },
    ],
  },
  education: {
    heading: "Formação",
    items: [
      {
        title: "Tecnologia em Sistemas para Internet",
        logo: "ifpb",
        detail: "Instituto Federal da Paraíba (IFPB), campus João Pessoa",
        period: "out. 2024 – jul. 2027 (previsão)",
      },
      { title: "Monitor da disciplina de Segurança de Dados", period: "semestre 2026.2" },
      { title: "Inglês fluente", period: "C2, EF SET" },
    ],
  },
  ui: { themeToggle: "Tema escuro", otherLang: { label: "English", href: locales.en.path, lang: "en" } },
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
