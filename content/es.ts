import type { Content } from "./types";

// Fonte do texto: docs/copy-deck.md (seção Español). O Caio revisa no PR.
export const es: Content = {
  meta: { title: "Caio Mayan — Ingeniero de Software" },
  hero: {
    name: "Caio Mayan",
    title: "Ingeniero de Software",
    lead: "Rumbo a la ingeniería de IA: LLMs, agentes y el backend que los sostiene.",
    leadShine: "ingeniería de IA",
    place: { city: "João Pessoa, Brasil" },
    photoAlt: "Retrato de Caio Mayan",
  },
  contact: {
    label: "Contacto",
    email: { label: "mail@caiomayan.com", href: "mailto:mail@caiomayan.com" },
    linkedin: { label: "LinkedIn", href: "https://www.linkedin.com/in/caiomayan/", external: true },
    github: { label: "GitHub", href: "https://github.com/caiomayan", external: true },
    resume: { label: "Currículum (PDF)", href: "/caio-mayan-resume.pdf" },
  },
  weather: {
    labels: { clear: "Cielo despejado", partly: "Parcialmente nublado", cloudy: "Nublado", fog: "Niebla", rain: "Lluvia", storm: "Tormenta" },
    credit: { prefix: "Datos del clima de", name: "Open-Meteo.com", href: "https://open-meteo.com/" },
  },
  languages: {
    heading: "Idiomas",
    items: [
      { name: "Inglés", level: "Avanzado", sub: "Certificado EF SET · C2" },
      { name: "Portugués", level: "Nativo" },
    ],
  },
  experience: {
    heading: "Experiencia",
    jobs: [
      {
        company: "TechEduConnect",
        logo: "techeduconnect",
        companyUrl: "https://www.techeduconnect.com.br/",
        role: "Pasante de Ingeniería de Software",
        period: "oct. 2026 – actual · remoto",
        about:
          "Edtech especializada en Moodle (implantación, plugins, integraciones y hosting) para instituciones educativas y empresas.",
        lines: [
          "Plugin de corrección de redacciones con IA para Moodle, en producción en una institución de educación superior. La IA propone la evaluación y el tutor la revisa y la aprueba.",
          "Plataformas de enseñanza propias en Next.js y TypeScript, y personalizaciones e integraciones para Moodle en PHP.",
          "Desarrollo con agentes de código (Claude Code con skills), a partir de specs, pruebas y quality gates.",
        ],
        stack: {
          label: "Hecho con",
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
        role: "Joven Aprendiz, área de Compras",
        period: "may. 2024 – may. 2025 · João Pessoa",
        lines: [
          "Compras de EPP, ingeniería clínica y TI, contratos y proveedores, en un hospital especializado en oncología.",
        ],
      },
    ],
  },
  education: {
    heading: "Formación",
    items: [
      {
        title: "Tecnología en Sistemas para Internet",
        logo: "ifpb",
        detail: "Instituto Federal de Paraíba (IFPB), campus João Pessoa",
        description:
          "Donde construí, y sigo fortaleciendo, mi base: Java y Spring Boot, bases de datos, estructuras de datos y seguridad de la información.",
        period: "oct. 2024 – jul. 2027 (previsión)",
        children: [{ label: "Monitoría", title: "Asignatura de Seguridad de Datos", period: "semestre 2026.2" }],
        stack: {
          label: "En el curso",
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
  ui: { themeToggle: "Tema oscuro", language: "Idioma" },
  activity: { heading: "Actividad", total: { one: "{n} contribución en el último año", other: "{n} contribuciones en el último año" } },
  foundations: {
    heading: "Fundamentos",
    groups: [
      {
        label: "Base",
        items: [
          { name: "Estructuras de datos" },
          { name: "Bases de datos y modelado" },
          { name: "Análisis y diseño de sistemas" },
        ],
      },
      {
        label: "Ingeniería",
        items: [
          { name: "Backend y APIs" },
          { name: "Seguridad de la información" },
          { name: "Infraestructura y entrega", detail: "contenedores, cloud, CI/CD" },
        ],
      },
      {
        label: "Método e IA",
        items: [
          { name: "Pruebas y calidad", detail: "TDD, quality gates" },
          { name: "Desarrollo guiado por especificación", detail: "SDD" },
          { name: "IA aplicada", detail: "LLMs y agentes" },
        ],
      },
    ],
  },
  footer: { copyright: "© {year} Caio Mayan" },
  carmine: {
    heading: "Carmine",
    note: "Proyecto personal",
    name: "Carmine",
    what: "SaaS para jugadores y equipos competitivos de Counter-Strike 2.",
    status: "En desarrollo, lanzamiento previsto para 2027",
    how: "Desarrollado con agentes de IA que abren issues y pull requests y mantienen las specs y el backlog al día, con un entorno de pruebas separado de producción.",
    stack: {
      label: "Hecho con",
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
      repo: { label: "Repositorio", href: "https://github.com/caiomayan/carmine" },
    },
  },
};
