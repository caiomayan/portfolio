import type { Content } from "./types";

// Provisório: o inglês ainda não foi escrito (copy-deck.md, seção English).
// Até a tarefa da versão em inglês, mostra o texto em português.
import { pt } from "./pt";

export const en: Content = {
  ...pt,
  // O PDF em inglês já existe; o rótulo continua provisório, como o resto do texto.
  contact: { ...pt.contact, resume: { ...pt.contact.resume!, href: "/caio-mayan-resume.pdf" } },
};
