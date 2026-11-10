import { locales } from "@/lib/locales";
import type { Content } from "./types";

// Fonte do texto: docs/copy-deck.md (seção English). O Caio revisa no PR da versão em inglês.
export const en: Content = {
  meta: { title: "Caio Mayan — Software Engineer" },
  hero: {
    name: "Caio Mayan",
    title: "Software Engineer",
    lead: "I build products on applied AI, on a solid backend foundation.",
    location: "João Pessoa, Brazil",
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
    map: { place: "João Pessoa, Brazil", offset: "UTC−3" },
    languages: "Portuguese (native) · English (fluent, C2)",
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
        logo: "hospital",
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
        description:
          "Where I built, and keep strengthening, my foundation: Java and Spring Boot, databases, data structures and information security.",
        period: "Oct. 2024 – Jul. 2027 (expected)",
        children: [{ title: "Teaching Assistant: Data Security course", period: "2026.2 semester" }],
      },
    ],
  },
  ui: { themeToggle: "Dark theme", otherLang: { label: "Português", href: locales.pt.path, lang: "pt", flag: "BR", country: "Brazil" } },
  technologies: {
    heading: "Technologies",
    items: [
      { name: "Java", icon: "coffee" },
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
    note: "Personal project",
    name: "Carmine",
    what: "SaaS for competitive Counter-Strike 2 players and teams.",
    status: "In development, launch expected in 2027",
    how: "Built with AI agents that open issues and pull requests and keep the specs and the backlog up to date, with a staging environment separate from production.",
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
      repo: { label: "Repository", href: "https://github.com/caiomayan/carmine" },
    },
  },
};
