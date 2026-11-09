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
};
