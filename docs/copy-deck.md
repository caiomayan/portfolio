# Texto do site (copy deck)

Fonte única do texto do caiomayan.com. Os protótipos e o site usam este texto, sem inventar nada além dele.

Regras: nunca citar o nome da instituição que usa o plugin, projetos anteriores nem os termos da lista de termos proibidos (secret FORBIDDEN_TERMS, local em private/forbidden-terms.txt). Nada de telefone. Nada de métricas.

## Apresentação

- Nome: Caio Mayan
- Título: Engenheiro de Software
- Frase de abertura (#38): A caminho da engenharia de IA: LLMs, agentes e o backend que os sustenta. (Título e frase formam a descrição da página e a prévia: "Engenheiro de Software. A caminho da engenharia de IA: …".) **Brilho (#39, rodada 4):** só o trecho "engenharia de IA" recebe o brilho cinza que corre devagar (marcado em `content/pt.ts`, `hero.leadShine`); o texto da frase não muda.
- Lugar (#38, três linhas empilhadas ao lado do mapa de pontos compacto, que fica centrado na altura delas): "João Pessoa, Brasil"; a hora local, só "18:06" (24 h, fuso America/Fortaleza, atualizada a cada minuto; a hora não vem no HTML do servidor; o "(UTC−3)" saiu da tela, o fuso segue no cálculo); e o clima (abaixo), ícone e temperatura, "27°C". Fica embaixo da frase de abertura, na primeira tela, na faixa à esquerda.
- Contato na primeira tela (#38): a seção Contato e o link "Contato ↓" saíram. Na faixa da primeira tela, à direita, ficam só ícones (alvos de 44 px, tooltip, uma parada de Tab e setas): e-mail (`mailto:`, o endereço mail@caiomayan.com é o tooltip e o nome acessível), LinkedIn, GitHub e Currículo (PDF). Nome acessível do grupo (proposto, o Caio revisa): "Contato".
- Foto: `assets/foto-original.jpg`

## Carmine

- Nome: Carmine
- Ordem na tela (#34): o que é, como é feito (os dois em tom principal), situação, stack e links. Os textos abaixo não mudaram, só a ordem.
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
- Título da seção (#29): o nome "Carmine", no mesmo título grande das outras seções (com o logo antes do nome), e embaixo, discreto, "Projeto pessoal" (vindo do protótipo; proposto, o Caio revisa). Depois vêm situação, o que é, como é feito, stack e links.
- Prints do Carmine removidos (#18): sem abas, legenda nem rótulo das telas. Fica o rótulo da lista: "Feito com" (#29; proposto, o Caio revisa; antes "Stack").

## Experiência

### TechEduConnect
- Cargo: Estagiário de Engenharia de Software
- Período: out. 2026 – atual · remoto
- Sobre a empresa: edtech especializada em Moodle (implantação, plugins, integrações e hospedagem) para instituições de ensino e empresas. Site: https://www.techeduconnect.com.br/
- Linhas:
  - Plugin de correção de redações com IA para Moodle, em produção numa instituição de ensino superior. A IA propõe a avaliação e o tutor revisa e aprova.
  - Plataformas de ensino próprias em Next.js e TypeScript, e customizações e integrações para Moodle em PHP.
  - Desenvolvo com agentes de código (Claude Code com skills), a partir de specs, testes e quality gates.
  - Linha de ícones "Feito com" (#29), depois das linhas, só ícones (nome no tooltip): Next.js, TypeScript, PHP, Moodle.

### Hospital Napoleão Laureano
- Cargo: Jovem Aprendiz, setor de Compras
- Período: mai. 2024 – mai. 2025 · João Pessoa
- Linha: compras de EPIs, engenharia clínica e TI, contratos e fornecedores, num hospital especializado em oncologia.

## Formação

- Tecnologia em Sistemas para Internet, Instituto Federal da Paraíba (IFPB), campus João Pessoa. Out. 2024 – jul. 2027 (previsão). (#27)
  - Descrição curta embaixo (#27, proposto, o Caio revisa): "Onde construí e sigo fortalecendo minha base: Java e Spring Boot, bancos de dados, estrutura de dados e segurança da informação."
  - Linha de ícones "No curso" (#29), embaixo da descrição, só ícones (nome no tooltip): Java, Spring Boot, Node.js, TypeScript, Python, PostgreSQL, MongoDB, Next.js, Angular, Docker, Git.
  - Subitem (filho do curso): rótulo "Monitoria" + título "Disciplina de Segurança de Dados", período "semestre 2026.2". Sem dizer "atividade do curso".
- "Inglês fluente" saiu de Formação (#27): as línguas ficam na seção Idiomas (#38).

## Fundamentos (#29)

Seção entre Formação e Atividade, só texto, sem ícones: o que ele sabe de base (as ferramentas mudam; elas aparecem só onde têm contexto, em Formação, Experiência e Carmine). Título: "Fundamentos". Três grupos lado a lado no desktop e empilhados no celular; cada grupo tem um rótulo pequeno e 3 itens, cada item com o nome e, quando houver, o detalhe numa linha menor embaixo (pedido do Caio; o texto de cada item é dele):

- **Base:** Estruturas de dados · Bancos de dados e modelagem · Análise e projeto de sistemas
- **Engenharia:** Backend e APIs · Segurança da informação · Infraestrutura e entrega (detalhe: containers, cloud, CI/CD)
- **Método e IA:** Testes e qualidade (detalhe: TDD, quality gates) · Desenvolvimento guiado por especificação (detalhe: SDD) · IA aplicada (detalhe: LLMs e agentes)

## Contato (#38: sem seção própria)

A seção Contato saiu: os ícones moram na faixa da primeira tela (ver Apresentação). Dados:

- E-mail: mail@caiomayan.com (só ícone, sem botão de copiar)
- LinkedIn: https://www.linkedin.com/in/caiomayan/
- GitHub: https://github.com/caiomayan
- Currículo (PDF): link por língua. Arquivos em `public/`: `caio-mayan-curriculo.pdf` (pt) e `caio-mayan-resume.pdf` (en e es). Só ícone: o rótulo "Currículo (PDF)" vira tooltip e nome acessível, assim como "LinkedIn" e "GitHub".
- Clima (#28, proposto, o Caio revisa; na primeira tela desde a #29): ícone do tempo e temperatura atual de João Pessoa, por exemplo "☁ 28°C", na terceira linha do lugar. O nome do tempo só é lido por leitor de tela: "Céu limpo", "Parcialmente nublado", "Nublado", "Neblina", "Chuva", "Tempestade". De noite o ícone é o da versão noturna (lua; nuvem com lua), pelo `is_day` do Open-Meteo. O crédito (licença CC BY 4.0 do Open-Meteo, #39 rodada 5) é a própria temperatura, que vira um link discreto para open-meteo.com (igual ao texto, com sublinhado só no hover e no foco; abre em nova aba), com título e nome acessível "Dados do clima: Open-Meteo.com" (`weather.credit.label` em `content/`; o nome acessível começa pela temperatura, por exemplo "28°C. Dados do clima: Open-Meteo.com"). O crédito não está mais no rodapé. Se a API falha, nada disso aparece.

## Idiomas (#38)

Seção própria no fim da página, depois de Atividade, com o mesmo título grande das outras seções e sem bandeiras. Lista o que o Caio fala, por isso não tem espanhol. Duas linhas de duas pontas (nome à esquerda, nível à direita):

- Inglês — Avançado. Logo abaixo, subnível no estilo da monitoria do curso (ícone de hierarquia, texto menor): "Certificado EF SET · C2".
- Português — Nativo.

## Rodapé (#29)

- Faixa mínima no fim da página, separada da última seção só por espaço (sem linha nem fundo): só "© 2026 Caio Mayan" (o crédito do clima saiu daqui: é o link da temperatura na primeira tela). O ano é o corrente, calculado ao gerar a página (`{year}` em `content/`).

## Atividade (#28, proposto, o Caio revisa)

- Bloco curto entre Fundamentos e Idiomas (logo depois de Fundamentos): título "Atividade" e o total do ano em texto, "1.234 contribuições no último ano" (singular: "1 contribuição no último ano"), com a grade de contribuições do GitHub do usuário caiomayan embaixo. Sem token ou com a API fora, o bloco inteiro não aparece.

## Interface

- Troca de idioma (#38, no lugar das bandeiras): botão com ícone de globo e a sigla da língua atual ("PT"), com `aria-expanded`; nome acessível "Idioma" (proposto, o Caio revisa). Abre um menu pequeno com "Português", "English" e "Español" (cada nome na própria língua, em todas as páginas), com um ✓ no idioma atual. Setas navegam, Esc fecha, clique fora fecha e o foco volta pro botão. Trocar de idioma não recarrega a página: o conteúdo troca na hora, com um crossfade curto (até 200 ms), o endereço muda (`/`, `/en`, `/es`), a rolagem fica onde estava, e o `lang`, o título e as metas acompanham. Com movimento reduzido, a troca é imediata.
- Botão de tema (nome acessível; proposto pelo build, o Caio revisa): "Tema escuro" (pt). Em inglês: "Dark theme" (seção English).
- Título da aba (proposto, o Caio revisa): "Caio Mayan — Engenheiro de Software". A descrição e a prévia (OG) usam a frase de abertura.

## English

Tradução fiel do texto acima, escrita na tarefa da versão em inglês (#7). Valem as mesmas regras do topo deste arquivo. Nomes próprios, stack e links não mudam. **O Caio revisa este texto no PR.**

### Presentation

- Name: Caio Mayan
- Title: Software Engineer
- Opening line (#38): On the path to AI engineering: LLMs, agents and the backend that holds them up. (Title and line form the page description and the preview: "Software Engineer. On the path to AI engineering: …".) **Shine (#39, round 4):** only "AI engineering" gets the slow gray shine (marked in `content/en.ts`, `hero.leadShine`); the sentence text does not change.
- Place (#38, three stacked lines next to the compact dot map, which is centered on their height): "João Pessoa, Brazil"; the local time, just "18:06" (24-hour, America/Fortaleza, updated every minute; the time is not in the server HTML; "(UTC−3)" left the screen, the time zone stays in the calculation); and the weather (below), icon and temperature, "27°C". Sits under the opening line, on the first screen, in the strip on the left.
- Contact on the first screen (#38): the Contact section and the "Contact ↓" link are gone. In the first screen's strip, on the right, icons only (44 px targets, tooltip, one Tab stop and arrow keys): email (`mailto:`, the address mail@caiomayan.com is the tooltip and the accessible name), LinkedIn, GitHub and Resume (PDF). Accessible name of the group (proposed, Caio reviews): "Contact".
- Photo alt: "Portrait of Caio Mayan"

### Carmine

- Name: Carmine
- Section title (#29): the name "Carmine", in the same large heading as the other sections (logo before the name), and below it, discreet, "Personal project". Then status, what it is, how it is built, stack and links.
- Order on screen (#34): what it is, how it is built (both in the main tone), status, stack and links. The texts below did not change, only the order.
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
- Screenshots removed (#18); list label "Built with" (#29; proposed, Caio reviews; was "Stack").

### Experience

#### TechEduConnect
- Role: Software Engineering Intern
- Period: Oct. 2026 – present · remote
- About the company: Edtech specialized in Moodle (deployment, plugins, integrations and hosting) for educational institutions and companies.
- Lines:
  - AI-powered essay grading plugin for Moodle, in production at a higher-education institution. The AI proposes the assessment and the tutor reviews and approves it.
  - In-house learning platforms in Next.js and TypeScript, plus Moodle customizations and integrations in PHP.
  - I develop with coding agents (Claude Code with skills), working from specs, tests and quality gates.
  - Icon row "Built with" (#29), after the lines, icons only (name in the tooltip): Next.js, TypeScript, PHP, Moodle.

#### Hospital Napoleão Laureano
- Role: Apprentice – Procurement
- Period: May 2024 – May 2025 · João Pessoa
- Line: Purchasing of PPE, clinical engineering and IT, contracts and suppliers, at a hospital specialized in oncology.

### Education

- Associate Degree in Internet Systems Technology, Federal Institute of Paraíba (IFPB), João Pessoa campus. Oct. 2024 – Jul. 2027 (expected).
  - Short description below (#27, proposed, Caio reviews): "Where I built, and keep strengthening, my foundation: Java and Spring Boot, databases, data structures and information security."
  - Icon row "In the course" (#29), below the description, icons only (name in the tooltip): Java, Spring Boot, Node.js, TypeScript, Python, PostgreSQL, MongoDB, Next.js, Angular, Docker, Git.
  - Sub-item (child of the course): label "Teaching assistant" + title "Data Security course", period "2nd semester of 2026".
- "Fluent English" left Education (#27): languages are in the Languages section (#38).

### Foundations (#29)

Section between Education and Activity, text only, no icons: what he knows at the base (tools change; they appear only where they have context: Education, Experience and Carmine). Title: "Foundations". Three groups side by side on desktop and stacked on mobile; each group has a small label and 3 items, each with the name and, when there is one, a detail on a smaller line below. The first group's label is "Core" (not "Foundations", to avoid repeating the title):

- **Core:** Data structures · Databases and data modeling · Systems analysis and design
- **Engineering:** Backend and APIs · Information security · Infrastructure and delivery (detail: containers, cloud, CI/CD)
- **Method and AI:** Testing and quality (detail: TDD, quality gates) · Spec-driven development (detail: SDD) · Applied AI (detail: LLMs and agents)

### Contact (#38: no section of its own)

The Contact section is gone: the icons live in the first screen's strip (see Presentation). Data:

- Email: mail@caiomayan.com (icon only, no copy button)
- Resume (PDF): icon only; "Resume (PDF)" is the tooltip and accessible name, file `caio-mayan-resume.pdf`.
- Weather (#28, proposed, Caio reviews; on the first screen since #29): a weather icon and the current temperature in João Pessoa, e.g. "☁ 28°C", on the third line of the place. The weather name is read by screen readers only: "Clear sky", "Partly cloudy", "Cloudy", "Fog", "Rain", "Thunderstorm". At night the icon is the night version (moon; cloud with moon), from Open-Meteo’s `is_day`. The credit (Open-Meteo CC BY 4.0, #39 round 5) is the temperature itself, which becomes a discreet link to open-meteo.com (same look as the text, underlined only on hover and focus; opens in a new tab), with the title and accessible name "Weather data by Open-Meteo.com" (`weather.credit.label` in `content/`; the accessible name starts with the temperature, e.g. "28°C. Weather data by Open-Meteo.com"). The credit is no longer in the footer. If the API fails, none of this shows.

### Languages (#38)

Section of its own at the end of the page, after Activity, with the same large heading as the other sections and no flags. It lists what Caio speaks, so it has no Spanish. Two two-ended rows (name on the left, level on the right):

- English — Advanced. Right below, a sub-level in the style of the course's teaching assistant row (hierarchy icon, smaller text): "EF SET certificate · C2".
- Portuguese — Native.

### Footer (#29)

- Minimal strip at the end of the page, separated from the last section by space only (no line, no background): only "© 2026 Caio Mayan" (the weather credit left: it is the temperature link on the first screen). The year is the current year, computed when the page is generated (`{year}` in `content/`).

### Activity (#28, proposed, Caio reviews)

- Short block between Foundations and Languages (right after Foundations): heading "Activity" and the yearly total as text, "1,234 contributions in the last year" (singular: "1 contribution in the last year"), with the GitHub contribution grid for user caiomayan below. Without a token or with the API down, the whole block is absent.

### Interface

- Language switch (#38, replaces the flags): a button with a globe icon and the current language code ("EN"), with `aria-expanded`; accessible name "Language" (proposed, Caio reviews). It opens a small menu with "Português", "English" and "Español" (each name in its own language, on every page), with a ✓ on the current one. Arrow keys move, Esc closes, a click outside closes, and focus returns to the button. Switching language does not reload the page: the content changes at once, with a short crossfade (up to 200 ms), the address changes (`/`, `/en`, `/es`), the scroll stays where it was, and `lang`, the title and the metas follow. With reduced motion, the switch is immediate.
- Theme button (accessible name): "Dark theme".
- Tab title: "Caio Mayan — Software Engineer". The description and the preview (OG) use the opening line.
- Section headings: "Experience", "Education", "Foundations", "Activity", "Languages".

## Español (#38)

Traducción fiel del texto de arriba, escrita en la tarea del español. Valen las mismas reglas del inicio de este archivo. Nombres propios, stack y enlaces no cambian. La sección Idiomas no tiene español: lista lo que Caio habla. **El Caio revisa este texto en el PR.**

### Presentación

- Nombre: Caio Mayan
- Título: Ingeniero de Software
- Frase de apertura: Rumbo a la ingeniería de IA: LLMs, agentes y el backend que los sostiene. (Descripción de la página: "Ingeniero de Software. Rumbo a la ingeniería de IA: …".) **Brillo (#39, ronda 4):** solo el tramo "ingeniería de IA" recibe el brillo gris que corre despacio (marcado en `content/es.ts`, `hero.leadShine`); el texto de la frase no cambia.
- Lugar: "João Pessoa, Brasil"; la hora local, "18:06"; el clima, ícono y temperatura, "27°C". Mapa de puntos compacto al lado, decorativo.
- Contacto en la primera pantalla: solo íconos a la derecha de la franja (nombre accesible del grupo: "Contacto"): correo (mail@caiomayan.com), LinkedIn, GitHub y "Currículum (PDF)" (el archivo es `caio-mayan-resume.pdf`, en inglés).
- Alt de la foto: "Retrato de Caio Mayan"

### Carmine

- Nombre: Carmine
- Título de la sección: "Carmine" y debajo, discreto, "Proyecto personal".
- Qué es: SaaS para jugadores y equipos competitivos de Counter-Strike 2.
- Situación: En desarrollo, lanzamiento previsto para 2027
- Cómo está hecho: Desarrollado con agentes de IA que abren issues y pull requests y mantienen las specs y el backlog al día, con un entorno de pruebas separado de producción.
- Stack (solo íconos): Nest.js · Next.js · Valkey · CounterStrikeSharp · AWS EC2 · Oracle Cloud
- Etiqueta de la lista: "Hecho con". Enlaces: stcarmine.com · "Repositorio"

### Experiencia

#### TechEduConnect
- Cargo: Pasante de Ingeniería de Software
- Período: oct. 2026 – actual · remoto
- Sobre la empresa: Edtech especializada en Moodle (implantación, plugins, integraciones y hosting) para instituciones educativas y empresas.
- Líneas:
  - Plugin de corrección de redacciones con IA para Moodle, en producción en una institución de educación superior. La IA propone la evaluación y el tutor la revisa y la aprueba.
  - Plataformas de enseñanza propias en Next.js y TypeScript, y personalizaciones e integraciones para Moodle en PHP.
  - Desarrollo con agentes de código (Claude Code con skills), a partir de specs, pruebas y quality gates.
  - Fila de íconos "Hecho con": Next.js, TypeScript, PHP, Moodle.

#### Hospital Napoleão Laureano
- Cargo: Joven Aprendiz, área de Compras
- Período: may. 2024 – may. 2025 · João Pessoa
- Línea: compras de EPP, ingeniería clínica y TI, contratos y proveedores, en un hospital especializado en oncología.

### Formación

- Tecnología en Sistemas para Internet, Instituto Federal de Paraíba (IFPB), campus João Pessoa. Oct. 2024 – jul. 2027 (previsión).
  - Descripción corta: "Donde construí, y sigo fortaleciendo, mi base: Java y Spring Boot, bases de datos, estructuras de datos y seguridad de la información."
  - Fila de íconos "En el curso": Java, Spring Boot, Node.js, TypeScript, Python, PostgreSQL, MongoDB, Next.js, Angular, Docker, Git.
  - Subítem: etiqueta "Monitoría" + título "Asignatura de Seguridad de Datos", período "semestre 2026.2".

### Fundamentos

Título: "Fundamentos". Tres grupos:

- **Base:** Estructuras de datos · Bases de datos y modelado · Análisis y diseño de sistemas
- **Ingeniería:** Backend y APIs · Seguridad de la información · Infraestructura y entrega (detalle: contenedores, cloud, CI/CD)
- **Método e IA:** Pruebas y calidad (detalle: TDD, quality gates) · Desarrollo guiado por especificación (detalle: SDD) · IA aplicada (detalle: LLMs y agentes)

### Actividad

- Título "Actividad" y el total del año, "1.234 contribuciones en el último año" (singular: "1 contribución en el último año"), con la grilla de contribuciones de GitHub debajo. Sin token o con la API caída, el bloque no aparece.

### Idiomas

- Título: "Idiomas". Inglés — Avanzado; debajo, subnivel: "Certificado EF SET · C2". Portugués — Nativo. Sin español.

### Pie de página

- Solo "© {year} Caio Mayan". El crédito del clima (Open-Meteo, CC BY 4.0) ya no está aquí: es la propia temperatura de la primera pantalla, un enlace discreto a open-meteo.com con título y nombre accesible "Datos del clima: Open-Meteo.com" (`weather.credit.label` en `content/`).

### Interfaz

- Cambio de idioma: botón con globo y la sigla actual ("ES"), nombre accesible "Idioma"; menú con "Português", "English" y "Español", con ✓ en el actual.
- Botón de tema (nombre accesible): "Tema oscuro".
- Título de la pestaña: "Caio Mayan — Ingeniero de Software".
- Clima (nombres solo para lector de pantalla): "Cielo despejado", "Parcialmente nublado", "Nublado", "Niebla", "Lluvia", "Tormenta".
- Títulos de sección: "Experiencia", "Formación", "Fundamentos", "Actividad", "Idiomas".
