import { locales } from "@/lib/locales";
import type { Content } from "./types";

// Fonte do texto: docs/copy-deck.md (seção English). O Caio revisa no PR da versão em inglês.
export const en: Content = {
  meta: { title: "Caio Mayan — Software Engineer" },
  hero: {
    name: "Caio Mayan",
    title: "Software Engineer",
    lead: "I build products on applied AI, on a solid backend foundation.",
    location: "João Pessoa, Paraíba",
    photoAlt: "Portrait of Caio Mayan",
  },
  contact: {
    heading: "Contact",
    email: "mail@caiomayan.com",
    copyEmail: "Copy email",
    copied: "Copied",
    linkedin: { label: "LinkedIn", href: "https://www.linkedin.com/in/caiomayan/", external: true },
    github: { label: "GitHub", href: "https://github.com/caiomayan", external: true },
    resume: { label: "Resume (PDF)", href: "/caio-mayan-resume.pdf" },
  },
  experience: {
    heading: "Experience",
    jobs: [
      {
        company: "TechEduConnect",
        logo: "techeduconnect",
        companyUrl: "https://www.techeduconnect.com.br/",
        role: "Software Engineering Intern",
        period: "Oct. 2026 – present · remote",
        about:
          "Edtech specialized in Moodle (deployment, plugins, integrations and hosting) for educational institutions and companies.",
        lines: [
          "AI-powered essay grading plugin for Moodle, in production at a higher-education institution. The AI proposes the assessment and the tutor reviews and approves it.",
          "In-house learning platforms in Next.js, React and TypeScript, plus Moodle customizations and integrations in PHP.",
          "I develop with coding agents (Claude Code with skills), working from specs, tests and quality gates.",
        ],
      },
      {
        company: "Hospital Napoleão Laureano",
        role: "Apprentice – Procurement",
        period: "May 2024 – May 2025 · João Pessoa",
        lines: [
          "Purchasing of PPE, clinical engineering and IT, contracts and suppliers, at a hospital specialized in oncology.",
        ],
      },
    ],
  },
  education: {
    heading: "Education",
    items: [
      {
        title: "Associate Degree in Internet Systems Technology",
        logo: "ifpb",
        detail: "Federal Institute of Paraíba (IFPB), João Pessoa campus",
        period: "Oct. 2024 – Jul. 2027 (expected)",
      },
      { title: "Teaching Assistant: Data Security course", period: "2026.2 semester" },
      { title: "Fluent English", period: "C2, EF SET" },
    ],
  },
  ui: { themeToggle: "Dark theme", otherLang: { label: "Português", href: locales.pt.path, lang: "pt" } },
  carmine: {
    heading: "Carmine",
    note: "Personal project",
    name: "Carmine",
    what: "SaaS for competitive Counter-Strike 2 players and teams.",
    status: "In development, launch expected in 2027",
    how: "Built with AI agents that open issues and pull requests and keep the specs and the backlog up to date, with a staging environment separate from production.",
    shotsLabel: "Carmine screens",
    shots: [
      { id: "inventario", tab: "Inventory", alt: "Carmine's Inventory screen, showing the item catalog, on stcarmine.com" },
      { id: "ranking", tab: "Ranking", alt: "Carmine's weekly Ranking screen on stcarmine.com" },
    ],
    shotsCaption: "Screenshots from stcarmine.com, live.",
    stackLabel: "Stack",
    stack: [
      { name: "Nest.js", role: "backend", logo: "nestjs" },
      { name: "Next.js", role: "frontend", logo: "nextdotjs" },
      { name: "Valkey", role: "cache and queues", logo: "valkey" },
      { name: "CounterStrikeSharp", role: "CS2 server plugins", logo: null },
      { name: "AWS EC2", role: "test CS2 servers", logo: "amazonec2" },
      { name: "Oracle Cloud", role: "web server, on an Ampere machine", logo: "oracle" },
    ],
    links: {
      site: { label: "stcarmine.com", href: "https://stcarmine.com" },
      repo: { label: "Repository", href: "https://github.com/caiomayan/carmine" },
    },
  },
};
