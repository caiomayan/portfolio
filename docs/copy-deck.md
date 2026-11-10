# Texto do site (copy deck)

Fonte única do texto do caiomayan.com. Os protótipos e o site usam este texto, sem inventar nada além dele.

Regras: nunca citar o nome da instituição que usa o plugin, projetos anteriores nem os termos da lista de termos proibidos (secret FORBIDDEN_TERMS, local em private/forbidden-terms.txt). Nada de telefone. Nada de métricas.

## Apresentação

- Nome: Caio Mayan
- Título: Engenheiro de Software
- Frase de abertura: Engenheiro de Software. Construo produtos com IA aplicada, sobre uma base sólida de backend.
- Lugar (#29, no lugar da linha "João Pessoa, PB"): mapa de pontos compacto (recorte das Américas e do Atlântico, com o pino em João Pessoa), decorativo, e ao lado, em texto, "João Pessoa, Brasil", a hora local, no formato "14:32 (UTC−3)" (24 h, fuso America/Fortaleza, atualizada a cada minuto; a hora não vem no HTML do servidor), e o clima (abaixo). Fica embaixo da frase de abertura, na primeira tela.
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
- Mapa e hora (#24): a partir da #29 estão na primeira tela (ver Apresentação); o Contato não tem mais mapa.
- Clima (#28, proposto, o Caio revisa; na primeira tela desde a #29): ao lado da hora, ícone do tempo e temperatura atual de João Pessoa, por exemplo "14:32 (UTC−3)  ☁ 28°C". O nome do tempo só é lido por leitor de tela: "Céu limpo", "Parcialmente nublado", "Nublado", "Neblina", "Chuva", "Tempestade". De noite o ícone é o da versão noturna (lua; nuvem com lua), pelo `is_day` do Open-Meteo. Crédito discreto numa linha no fim do Contato, depois dos idiomas (licença CC BY 4.0 do Open-Meteo): "Dados do clima por Open-Meteo.com" (o nome é um link). Se a API falha, nada disso aparece.
- Idiomas (#27), grupo pequeno no Contato, embaixo dos ícones: rótulo "Idiomas" e duas linhas, nome à esquerda e nível à direita: Português — nativo; Inglês — fluente · C2, EF SET.

## Atividade (#28, proposto, o Caio revisa)

- Bloco curto entre Tecnologias e Contato (logo depois de Tecnologias): título "Atividade" e o total do ano em texto, "1.234 contribuições no último ano" (singular: "1 contribuição no último ano"), com a grade de contribuições do GitHub do usuário caiomayan embaixo. Sem token ou com a API fora, o bloco inteiro não aparece.

## Interface

- Troca de língua (#24, #29): as duas bandeiras lado a lado, sempre na mesma ordem (Brasil, EUA). A da língua atual fica em destaque (cor cheia e uma marca sutil), com `aria-current="page"`, e não é link; a outra fica apagada e é o link pra rota equivalente. Nome acessível e `lang` do link: a língua de destino ("English" na página em português, "Português" na página em inglês); a atual tem o nome da própria língua só pra leitor de tela. Tooltip de cada bandeira: o nome do país, em português "Brasil" e "Estados Unidos"; em inglês "Brazil" e "United States".
- Botão de copiar e-mail: "Copiar e-mail" → "Copiado".
- Botão de tema (nome acessível; proposto pelo build, o Caio revisa): "Tema escuro" (pt). Em inglês: "Dark theme" (seção English).
- Título da aba (proposto, o Caio revisa): "Caio Mayan — Engenheiro de Software".

## English

Tradução fiel do texto acima, escrita na tarefa da versão em inglês (#7). Valem as mesmas regras do topo deste arquivo. Nomes próprios, stack e links não mudam. **O Caio revisa este texto no PR.**

### Presentation

- Name: Caio Mayan
- Title: Software Engineer
- Opening line: Software Engineer. I build products on applied AI, on a solid backend foundation.
- Place (#29, replaces the "João Pessoa, Brazil" line): compact dot map (crop of the Americas and the Atlantic, with a pin on João Pessoa), decorative, and next to it, as text, "João Pessoa, Brazil", the local time, formatted "14:32 (UTC−3)" (24-hour, America/Fortaleza, updated every minute; the time is not in the server HTML), and the weather (below). Sits under the opening line, on the first screen.
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
- Map and time (#24): since #29 they are on the first screen (see Presentation); Contact no longer has a map.
- Weather (#28, proposed, Caio reviews; on the first screen since #29): next to the time, a weather icon and the current temperature in João Pessoa, e.g. "14:32 (UTC−3)  ☁ 28°C". The weather name is read by screen readers only: "Clear sky", "Partly cloudy", "Cloudy", "Fog", "Rain", "Thunderstorm". At night the icon is the night version (moon; cloud with moon), from Open-Meteo’s `is_day`. Discreet credit on one line at the end of Contact, after the languages (Open-Meteo CC BY 4.0): "Weather data by Open-Meteo.com" (the name is a link). If the API fails, none of this shows.
- Languages (#27), small group in Contact, under the icons: label "Languages" and two lines, name left and level right: Portuguese — native; English — fluent · C2, EF SET.

### Activity (#28, proposed, Caio reviews)

- Short block between Technologies and Contact (right after Technologies): heading "Activity" and the yearly total as text, "1,234 contributions in the last year" (singular: "1 contribution in the last year"), with the GitHub contribution grid for user caiomayan below. Without a token or with the API down, the whole block is absent.

### Interface

- Language switch (#24, #29): both flags side by side, always in the same order (Brazil, US). The current language’s flag is highlighted (full color and a subtle mark), with `aria-current="page"`, and is not a link; the other is dimmed and is the link to the equivalent route. The link’s accessible name and `lang`: the target language ("English" on the Portuguese page, "Português" on the English page); the current one carries its own language name for screen readers only. Tooltip on each flag: the country name, in Portuguese "Brasil" and "Estados Unidos"; in English "Brazil" and "United States".
- Copy email button: "Copy email" → "Copied".
- Theme button (accessible name): "Dark theme".
- Tab title: "Caio Mayan — Software Engineer".
- Section headings: "Experience", "Education", "Technologies".
