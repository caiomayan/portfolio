import { locales } from "@/lib/locales";
import type { Content } from "./types";

// Fonte do texto: docs/copy-deck.md (seção English). O Caio revisa no PR da versão em inglês.
export const en: Content = {
  meta: { title: "Caio Mayan — Software Engineer" },
  hero: {
    name: "Caio Mayan",
    title: "Software Engineer",
    lead: "I build applied AI products on a solid backend foundation.",
    place: { city: "João Pessoa, Brazil", offset: "UTC−3" },
    photoAlt: "Portrait of Caio Mayan",
  },
  contact: {
    heading: "Contact",
    email: "mail@caiomayan.com",
    copyEmail: "Copy email",
    copied: "Copied",
    copyFailed: "Couldn't copy. Select the email.",
    linkedin: { label: "LinkedIn", href: "https://www.linkedin.com/in/caiomayan/", external: true },
    github: { label: "GitHub", href: "https://github.com/caiomayan", external: true },
    resume: { label: "Resume (PDF)", href: "/caio-mayan-resume.pdf" },
    weather: {
      labels: { clear: "Clear sky", partly: "Partly cloudy", cloudy: "Cloudy", fog: "Fog", rain: "Rain", storm: "Thunderstorm" },
      credit: { prefix: "Weather data by", name: "Open-Meteo.com", href: "https://open-meteo.com/" },
    },
    languages: {
      heading: "Languages",
      items: [
        { name: "Portuguese", level: "native", flag: "BR" },
        { name: "English", level: "fluent · C2, EF SET", flag: "US" },
      ],
    },
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
          "In-house learning platforms in Next.js and TypeScript, plus Moodle customizations and integrations in PHP.",
          "I develop with coding agents (Claude Code with skills), working from specs, tests and quality gates.",
        ],
        stack: {
          label: "Built with",
          items: [
            { name: "Next.js", logo: "nextdotjs" },
            { name: "TypeScript", logo: "typescript" },
            { name: "PHP", logo: "php" },
            { name: "Moodle", logo: "moodle" },
          ],
        },
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
        children: [{ label: "Teaching assistant", title: "Data Security course", period: "2nd semester of 2026" }],
        stack: {
          label: "In the course",
          items: [
            { name: "Java", logo: "java" },
            { name: "Spring Boot", logo: "springboot" },
            { name: "Node.js", logo: "nodedotjs" },
            { name: "TypeScript", logo: "typescript" },
            { name: "Python", logo: "python" },
            { name: "PostgreSQL", logo: "postgresql" },
            { name: "MongoDB", logo: "mongodb" },
            { name: "Next.js", logo: "nextdotjs" },
            { name: "Angular", logo: "angular" },
            { name: "Docker", logo: "docker" },
            { name: "Git", logo: "git" },
          ],
        },
      },
    ],
  },
  ui: { themeToggle: "Dark theme", currentLang: { label: "English", lang: "en", flag: "US", country: "United States" }, otherLang: { label: "Português", href: locales.pt.path, lang: "pt", flag: "BR", country: "Brazil" } },
  activity: { heading: "Activity", total: { one: "{n} contribution in the last year", other: "{n} contributions in the last year" } },
  foundations: {
    heading: "Foundations",
    groups: [
      {
        label: "Core",
        items: [
          { name: "Data structures" },
          { name: "Databases and data modeling" },
          { name: "Systems analysis and design" },
        ],
      },
      {
        label: "Engineering",
        items: [
          { name: "Backend and APIs" },
          { name: "Information security" },
          { name: "Infrastructure and delivery", detail: "containers, cloud, CI/CD" },
        ],
      },
      {
        label: "Method and AI",
        items: [
          { name: "Testing and quality", detail: "TDD, quality gates" },
          { name: "Spec-driven development", detail: "SDD" },
          { name: "Applied AI", detail: "LLMs and agents" },
        ],
      },
    ],
  },
  footer: { copyright: "© {year} Caio Mayan" },
  carmine: {
    heading: "Carmine",
    note: "Personal project",
    name: "Carmine",
    what: "SaaS for competitive Counter-Strike 2 players and teams.",
    status: "In development, launch expected in 2027",
    how: "Built with AI agents that open issues and pull requests and keep the specs and the backlog up to date, with a staging environment separate from production.",
    stack: {
      label: "Built with",
      items: [
        { name: "Nest.js", logo: "nestjs" },
        { name: "Next.js", logo: "nextdotjs" },
        { name: "Valkey", logo: "valkey" },
        { name: "CounterStrikeSharp", icon: "puzzle" },
        { name: "AWS EC2", logo: "amazonec2" },
        { name: "Oracle Cloud", logo: "oracle" },
      ],
    },
    links: {
      site: { label: "stcarmine.com", href: "https://stcarmine.com" },
      repo: { label: "Repository", href: "https://github.com/caiomayan/carmine" },
    },
  },
};
