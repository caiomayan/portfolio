# Texto do site (copy deck)

Fonte única do texto do caiomayan.com. Os protótipos e o site usam este texto, sem inventar nada além dele.

Regras: nunca citar o nome da instituição que usa o plugin, projetos anteriores nem os termos da lista de termos proibidos (secret FORBIDDEN_TERMS, local em private/forbidden-terms.txt). Nada de telefone. Nada de métricas.

## Apresentação

- Nome: Caio Mayan
- Título: Engenheiro de Software
- Frase de abertura: Engenheiro de Software. Construo produtos com IA aplicada, sobre uma base sólida de backend.
- Local: João Pessoa, PB (linha discreta embaixo da frase de abertura; #18, proposto, o Caio revisa)
- Foto: `assets/foto-original.jpg`

## Carmine

- Nome: Carmine
- O que é: SaaS para jogadores e times competitivos de Counter-Strike 2.
- Situação: em desenvolvimento, lançamento previsto para 2027.
- Como é feito: desenvolvido com agentes de IA que abrem issues e pull requests e mantêm as specs e o backlog em dia, com homologação separada da produção.
- Stack (só ícones; o nome aparece no tooltip e no nome acessível; sem a função de cada tecnologia, #18):
  - Nest.js
  - Next.js
  - Valkey
  - CounterStrikeSharp
  - AWS EC2
  - Oracle Cloud
- Links: stcarmine.com (https://stcarmine.com) · repositório (https://github.com/caiomayan/carmine)
- Rótulo lateral da seção: "Projeto pessoal" (vindo do protótipo; proposto, o Caio revisa).
- Prints do Carmine removidos (#18): sem abas, legenda nem rótulo das telas. Fica o título da lista: "Stack".

## Experiência

### TechEduConnect
- Cargo: Estagiário de Engenharia de Software
- Período: out. 2026 – atual · remoto
- Sobre a empresa: edtech especializada em Moodle (implantação, plugins, integrações e hospedagem) para instituições de ensino e empresas. Site: https://www.techeduconnect.com.br/
- Linhas:
  - Plugin de correção de redações com IA para Moodle, em produção numa instituição de ensino superior. A IA propõe a avaliação e o tutor revisa e aprova.
  - Plataformas de ensino próprias em Next.js, React e TypeScript, e customizações e integrações para Moodle em PHP.
  - Desenvolvo com agentes de código (Claude Code com skills), a partir de specs, testes e quality gates.

### Hospital Napoleão Laureano
- Cargo: Jovem Aprendiz, setor de Compras
- Período: mai. 2024 – mai. 2025 · João Pessoa
- Linha: compras de EPIs, engenharia clínica e TI, contratos e fornecedores, num hospital especializado em oncologia.

## Formação

- Tecnologia em Sistemas para Internet, Instituto Federal da Paraíba (IFPB), campus João Pessoa. Out. 2024 – jul. 2027 (previsão). (#27)
  - Descrição curta embaixo (#27, proposto, o Caio revisa): "Onde construí e sigo fortalecendo minha base: Java e Spring Boot, bancos de dados, estrutura de dados e segurança da informação."
  - Subitem (filho do curso): rótulo "Monitoria" + título "Disciplina de Segurança de Dados", período "semestre 2026.2". Sem dizer "atividade do curso".
- "Inglês fluente" saiu de Formação (#27): as línguas vão pro Contato.

## Tecnologias (#27)

Seção entre Formação e Contato, só ícones (o nome é o tooltip e o nome acessível, como a stack do Carmine). Título: "Tecnologias". Ordem do currículo: Java, Spring Boot, Node.js, TypeScript, Nest.js, Express, PHP, Python · React, Next.js · PostgreSQL, Redis, Valkey, MongoDB · Docker, AWS, Oracle Cloud, Vercel, Cloudflare, Git.

## Contato

- E-mail: mail@caiomayan.com (com botão de copiar)
- LinkedIn: https://www.linkedin.com/in/caiomayan/
- GitHub: https://github.com/caiomayan
- Currículo (PDF): link por língua. Arquivos em `public/`: `caio-mayan-curriculo.pdf` (pt) e `caio-mayan-resume.pdf` (en). Só ícone no site (#18): o rótulo "Currículo (PDF)" vira tooltip e nome acessível, assim como "LinkedIn" e "GitHub". O e-mail continua escrito.
- Mapa (#24): faixa de mapa-múndi decorativa com um pino em João Pessoa. Texto ao lado: "João Pessoa, Brasil" e a hora local, no formato "14:32 (UTC−3)" (24 h, fuso America/Fortaleza, atualizada a cada minuto; a hora não vem no HTML do servidor).
- Clima (#28, proposto, o Caio revisa): ao lado da hora, ícone do tempo e temperatura atual de João Pessoa, por exemplo "14:32 (UTC−3)  ☁ 28°C". O nome do tempo só é lido por leitor de tela: "Céu limpo", "Parcialmente nublado", "Nublado", "Neblina", "Chuva", "Tempestade". Crédito discreto embaixo do mapa (licença CC BY 4.0 do Open-Meteo): "Dados do clima por Open-Meteo.com" (o nome é um link). Se a API falha, nada disso aparece.
- Idiomas (#27), grupo pequeno embaixo da cidade e da hora: rótulo "Idiomas" e duas linhas, nome à esquerda e nível à direita: Português — nativo; Inglês — fluente · C2, EF SET.

## Atividade (#28, proposto, o Caio revisa)

- Bloco curto entre Tecnologias e Contato (logo depois de Tecnologias): título "Atividade" e o total do ano em texto, "1.234 contribuições no último ano" (singular: "1 contribuição no último ano"), com a grade de contribuições do GitHub do usuário caiomayan embaixo. Sem token ou com a API fora, o bloco inteiro não aparece.

## Interface

- Troca de língua (#24): só a bandeira do país da língua de destino (EUA na página em português, Brasil na página em inglês). Nome acessível e `lang`: a própria língua ("English" / "Português"). Tooltip: o nome do país, "Estados Unidos" (na página em português; em inglês a bandeira é a do Brasil e o tooltip é "Brazil").
- Botão de copiar e-mail: "Copiar e-mail" → "Copiado".
- Botão de tema (nome acessível; proposto pelo build, o Caio revisa): "Tema escuro" (pt). Em inglês: "Dark theme" (seção English).
- Título da aba (proposto, o Caio revisa): "Caio Mayan — Engenheiro de Software".

## English

Tradução fiel do texto acima, escrita na tarefa da versão em inglês (#7). Valem as mesmas regras do topo deste arquivo. Nomes próprios, stack e links não mudam. **O Caio revisa este texto no PR.**

### Presentation

- Name: Caio Mayan
- Title: Software Engineer
- Opening line: Software Engineer. I build products on applied AI, on a solid backend foundation.
- Location: João Pessoa, Brazil (#18, proposed, Caio reviews)
- Photo alt: "Portrait of Caio Mayan"

### Carmine

- Name: Carmine
- Side label: "Personal project"
- What it is: SaaS for competitive Counter-Strike 2 players and teams.
- Status: In development, launch expected in 2027
- How it is built: Built with AI agents that open issues and pull requests and keep the specs and the backlog up to date, with a staging environment separate from production.
- Stack (icons only; the name is the tooltip and the accessible name; no role per technology, #18):
  - Nest.js
  - Next.js
  - Valkey
  - CounterStrikeSharp
  - AWS EC2
  - Oracle Cloud
- Links: stcarmine.com · Repository
- Screenshots removed (#18); list title "Stack".

### Experience

#### TechEduConnect
- Role: Software Engineering Intern
- Period: Oct. 2026 – present · remote
- About the company: Edtech specialized in Moodle (deployment, plugins, integrations and hosting) for educational institutions and companies.
- Lines:
  - AI-powered essay grading plugin for Moodle, in production at a higher-education institution. The AI proposes the assessment and the tutor reviews and approves it.
  - In-house learning platforms in Next.js, React and TypeScript, plus Moodle customizations and integrations in PHP.
  - I develop with coding agents (Claude Code with skills), working from specs, tests and quality gates.

#### Hospital Napoleão Laureano
- Role: Apprentice – Procurement
- Period: May 2024 – May 2025 · João Pessoa
- Line: Purchasing of PPE, clinical engineering and IT, contracts and suppliers, at a hospital specialized in oncology.

### Education

- Associate Degree in Internet Systems Technology, Federal Institute of Paraíba (IFPB), João Pessoa campus. Oct. 2024 – Jul. 2027 (expected).
  - Short description below (#27, proposed, Caio reviews): "Where I built, and keep strengthening, my foundation: Java and Spring Boot, databases, data structures and information security."
  - Sub-item (child of the course): label "Teaching assistant" + title "Data Security course", period "2026.2 semester".
- "Fluent English" left Education (#27): languages moved to Contact.

### Technologies (#27)

Section between Education and Contact, icons only (the name is the tooltip and the accessible name). Title: "Technologies". Same list and order as the Portuguese one; names do not change.

### Contact

- Heading: Contact
- Email: mail@caiomayan.com (with copy button)
- Resume (PDF): icon only (#18); "Resume (PDF)" is the tooltip and accessible name, file `caio-mayan-resume.pdf`. Email stays as text.
- Map (#24): decorative world-map strip with a pin on João Pessoa. Text next to it: "João Pessoa, Brazil" and the local time, formatted "14:32 (UTC−3)" (24-hour, America/Fortaleza, updated every minute; the time is not in the server HTML).
- Weather (#28, proposed, Caio reviews): next to the time, a weather icon and the current temperature in João Pessoa, e.g. "14:32 (UTC−3)  ☁ 28°C". The weather name is read by screen readers only: "Clear sky", "Partly cloudy", "Cloudy", "Fog", "Rain", "Thunderstorm". Discreet credit below the map (Open-Meteo CC BY 4.0): "Weather data by Open-Meteo.com" (the name is a link). If the API fails, none of this shows.
- Languages (#27), small group under the city and time: label "Languages" and two lines, name left and level right: Portuguese — native; English — fluent · C2, EF SET.

### Activity (#28, proposed, Caio reviews)

- Short block between Technologies and Contact (right after Technologies): heading "Activity" and the yearly total as text, "1,234 contributions in the last year" (singular: "1 contribution in the last year"), with the GitHub contribution grid for user caiomayan below. Without a token or with the API down, the whole block is absent.

### Interface

- Language switch (#24): flag only (US on the Portuguese page, Brazil on the English one). Accessible name and `lang`: the language ("English" / "Português"). Tooltip: the country name, "Brazil" (on the English page; on the Portuguese page the flag is the US one and the tooltip is "Estados Unidos").
- Copy email button: "Copy email" → "Copied".
- Theme button (accessible name): "Dark theme".
- Tab title: "Caio Mayan — Software Engineer".
- Section headings: "Experience", "Education", "Technologies".
