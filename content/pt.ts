import { locales } from "@/lib/locales";
import type { Content } from "./types";

// Fonte do texto: docs/copy-deck.md
export const pt: Content = {
  meta: { title: "Caio Mayan — Engenheiro de Software" },
  hero: {
    name: "Caio Mayan",
    title: "Engenheiro de Software",
    lead: "Construo produtos com IA aplicada, sobre uma base sólida de backend.",
    location: "João Pessoa, PB",
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
    map: { place: "João Pessoa, Brasil", offset: "UTC−3" },
    weather: {
      labels: { clear: "Céu limpo", partly: "Parcialmente nublado", cloudy: "Nublado", fog: "Neblina", rain: "Chuva", storm: "Tempestade" },
      credit: { prefix: "Dados do clima por", name: "Open-Meteo.com", href: "https://open-meteo.com/" },
    },
    languages: {
      heading: "Idiomas",
      items: [
        { name: "Português", level: "nativo", flag: "BR" },
        { name: "Inglês", level: "fluente · C2, EF SET", flag: "US" },
      ],
    },
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
        logo: "hospital",
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
        description:
          "Onde construí e sigo fortalecendo minha base: Java e Spring Boot, bancos de dados, estrutura de dados e segurança da informação.",
        period: "out. 2024 – jul. 2027 (previsão)",
        children: [{ label: "Monitoria", title: "Disciplina de Segurança de Dados", period: "semestre 2026.2" }],
      },
    ],
  },
  ui: { themeToggle: "Tema escuro", otherLang: { label: "English", href: locales.en.path, lang: "en", flag: "US", country: "Estados Unidos" } },
  activity: { heading: "Atividade", total: { one: "{n} contribuição no último ano", other: "{n} contribuições no último ano" } },
  technologies: {
    heading: "Tecnologias",
    items: [
      { name: "Java", logo: "java" },
      { name: "Spring Boot", logo: "springboot" },
      { name: "Node.js", logo: "nodedotjs" },
      { name: "TypeScript", logo: "typescript" },
      { name: "Nest.js", logo: "nestjs" },
      { name: "Express", logo: "express" },
      { name: "PHP", logo: "php" },
      { name: "Python", logo: "python" },
      { name: "React", logo: "react" },
      { name: "Next.js", logo: "nextdotjs" },
      { name: "PostgreSQL", logo: "postgresql" },
      { name: "Redis", logo: "redis" },
      { name: "Valkey", logo: "valkey" },
      { name: "MongoDB", logo: "mongodb" },
      { name: "Docker", logo: "docker" },
      { name: "AWS", logo: "amazonwebservices" },
      { name: "Oracle Cloud", logo: "oracle" },
      { name: "Vercel", logo: "vercel" },
      { name: "Cloudflare", logo: "cloudflare" },
      { name: "Git", logo: "git" },
    ],
  },
  carmine: {
    heading: "Carmine",
    note: "Projeto pessoal",
    name: "Carmine",
    what: "SaaS para jogadores e times competitivos de Counter-Strike 2.",
    status: "Em desenvolvimento, lançamento previsto para 2027",
    how: "Desenvolvido com agentes de IA que abrem issues e pull requests e mantêm as specs e o backlog em dia, com homologação separada da produção.",
    stackLabel: "Stack",
    stack: [
      { name: "Nest.js", logo: "nestjs" },
      { name: "Next.js", logo: "nextdotjs" },
      { name: "Valkey", logo: "valkey" },
      { name: "CounterStrikeSharp", icon: "puzzle" },
      { name: "AWS EC2", logo: "amazonec2" },
      { name: "Oracle Cloud", logo: "oracle" },
    ],
    links: {
      site: { label: "stcarmine.com", href: "https://stcarmine.com" },
      repo: { label: "Repositório", href: "https://github.com/caiomayan/carmine" },
    },
  },
};
