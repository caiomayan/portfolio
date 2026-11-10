# DESIGN.md — caiomayan.com

Direção: **quiet instrument** (escolhida pelo Caio entre três protótipos; referência em `design/prototipo/`, só do visual, não do código). Tipografia e acabamento no espírito da Apple: títulos grandes com tracking negativo, muito espaço, superfícies separadas por tom (sem linhas), cantos e movimento suaves. Este arquivo descreve o que está no código; a fonte dos tokens é `app/globals.css`.

## Regras

- **Identidade só em preto e branco** e nos tons de cinza do tema (#18), com uma exceção por decisão do Caio (#24): a **bandeira** do seletor de língua é colorida e é a única cor da barra do topo. Não há cor de acento: o ponto do título, o ponto de status do Carmine, os sublinhados e a seleção de texto usam `--ink`/`--bg`. As cores de contexto continuam: as cores próprias dos logos (Valkey, IFPB etc.) e qualquer cor de estado que venha a existir. Um teste (`tests/e2e/identidade-preto-e-branco.spec.ts`) confere texto, fundos, bordas, sublinhados e pseudo-elementos nos dois temas, o CSS servido, o favicon e as imagens de prévia.
- Uma família só: **Inter variável** com eixo de tamanho óptico (`opsz`), carregada por `next/font` (sem pedido externo em tempo de execução). Nada de segunda família por enquanto.
- No máximo **4 tamanhos de texto**, todos tokens (`--text-small`, `--text-body`, `--text-lead`, `--text-display`). Não criar tamanhos soltos.
- Superfícies por tom (`--surface` sobre `--bg`), não por borda. Sombra só na foto.
- Sem ilustração grande, 3D, elementos de jogo ou cara de blog.
- Todo texto vem de `content/` (fonte única, `pt` e `en`); componentes não têm texto fixo.

## Tokens de cor

| Token | Claro (padrão) | Escuro |
|---|---|---|
| `--bg` | `#fbfbfd` | `#0b0b0c` |
| `--surface` | `#f2f2f5` | `#1a1a1c` |
| `--ink` | `#1d1d1f` | `#f5f5f7` |
| `--soft` | `#6e6e73` | `#a1a1a6` |
| `--shadow` | `0 1px 2px rgb(0 0 0 / 0.04), 0 12px 40px -12px rgb(0 0 0 / 0.18)` | `0 1px 2px rgb(0 0 0 / 0.4), 0 12px 40px -12px rgb(0 0 0 / 0.8)` |

A seleção de texto usa `--ink` de fundo e `--bg` no texto. `--shadow` é a sombra da foto, a única do site.
O site **abre sempre no claro**. O escuro é uma escolha do visitante (botão no topo), guardada em `localStorage` (`theme`) e aplicada por um script inline antes da primeira pintura (`data-theme="dark"` no `<html>`). O tema do sistema não é consultado.

## Primeira tela

- Foto original inteira (quadrado, sem corte), cantos de 28 px, 360 px no desktop; no celular fica pequena, sozinha (sem nome nem cidade embaixo: o nome é a assinatura do topo e a cidade é a linha embaixo da frase de abertura).
- Título (h1) em `--text-display` (até 104 px), peso 700, tracking −0,045em, com um ponto final na cor do texto. Esse ponto é ornamento tipográfico, não texto: vem de `h1::after` (`content: "." / ""`, sem texto alternativo, então leitores de tela não o leem) e fica fora de `content/` de propósito, porque o título do copy deck não tem ponto e a frase de abertura (`openingLine`) o monta como "título. lead". Frase de abertura em `--text-lead`, cor `--soft`; embaixo dela, a cidade numa linha discreta (`.place`, `--text-small`, `--soft`; texto `hero.location` de `content/`: "João Pessoa, PB" / "João Pessoa, Brazil").
- No canto superior esquerdo fica a assinatura (ver Movimento); no canto superior direito ficam o link de língua (pílula de 44 px de altura, **sem fundo em repouso**: o `--surface` aparece no hover e no foco do teclado, onde o contorno continua; mostra **só a bandeira** do país da língua de destino, SVG da biblioteca `country-flag-icons` (MIT, © 2020 @catamphetamine; `components/lang-flag.tsx`, 28 px de largura; só EUA e Brasil são importados e a bandeira é renderizada no servidor, sem entrar no JavaScript do cliente): EUA na página em português, Brasil na página em inglês; o nome acessível, o `lang` e o `hreflang` seguem sendo a língua ("English" / "Português", `ui.otherLang.label`) e o tooltip, que abre **embaixo e alinhado à direita** (`Tooltip below`, não há espaço em cima), mostra o país (`ui.otherLang.country`); é um link comum pra rota equivalente, sem script e sem escolha automática por língua do navegador) e, ao lado, o botão de tema (também sem fundo em repouso; fundo no hover e no foco). O `hreflang` entre `/` e `/en` sai de `lib/page-metadata.ts` (`alternates.languages`).

## Contato

- Última seção: título "Contato" (`h2`, em `--soft`), e-mail em `--text-lead` com botão de copiar ao lado (círculo de 44 px sem fundo em repouso, com `--surface` só no hover e no foco, como os botões do topo; só ícone, `aria-label`, foco visível). Ao copiar, o ícone vira o de confirmado por 2 s e uma região `role="status"` (só pra leitor de tela) anuncia "Copiado".
- Abaixo, LinkedIn, GitHub e Currículo (PDF) **só com ícone** (alvo de 44 px, sem texto do lado). O nome de cada um (`contact.linkedin.label` etc.) é o tooltip e o nome acessível (`aria-label`); o e-mail continua escrito, com o botão de copiar. O tooltip é o mesmo da stack do Carmine (`components/tooltip.tsx`, ver Seção Carmine). O link do PDF só aparece se a língua tem arquivo (`contact.resume` em `content/`).
- Ícones de interface: **lucide-animated** (registry `https://lucide-animated.com/r/<nome>.json`), copiados em `components/icons/` sem alteração (dependência `motion`). Animam no hover, no foco e no clique, disparados por `components/contact.tsx` e `theme-toggle.tsx`; com `prefers-reduced-motion` ficam parados (`lib/motion.ts`). O botão de tema também usa Sun/Moon do lucide-animated.
- **Mapa e hora local (#24)**, embaixo dos ícones: faixa de mapa-múndi em pontos (`components/contact-map.tsx`, largura 100%, máx. 640 px, proporção 720:272), em `--soft` a 50%, com um pino em João Pessoa (7,12° S, 34,88° O) em `--ink` e um pulso por trás dele (`pin-pulse`, só `transform` e `opacity`, 2,4 s; com `prefers-reduced-motion` fica um anel parado). O mapa é decorativo (`aria-hidden`); embaixo dele, em texto: "João Pessoa, Brasil" / "João Pessoa, Brazil" (`contact.map.place`) e a hora local, "14:32 (UTC−3)", de `Intl.DateTimeFormat` no fuso `America/Fortaleza` (24 h), atualizada a cada minuto cheio; não vem no HTML do servidor (cache) e o espaço dela já está reservado em CSS (`min-width: 14ch`, números tabulares), então não pula o layout. Sem API.
- **Dados do mapa:** Natural Earth (`ne_110m_land`, **domínio público**, naturalearthdata.com), projeção equiretangular, faixa de 78° N a 58° S. Os pontos (grade de 2,5°, só em terra) são gerados uma vez por `npm run world-map` (`scripts/generate-world-map.mjs`) em `lib/world-map.ts`; o GeoJSON é baixado pra `scripts/data/` (fora do git) e nada é baixado em tempo de execução. A posição do pino sai da mesma função de projeção (`project` em `lib/world-map.ts`); um teste confere onde ele cai.
- **Clima (#28)**, na mesma linha da hora: ícone do Lucide (`lucide-react`, 16 px, traço 1,75, `--soft`; `components/weather.tsx`) e a temperatura ("28°C"), renderizados **no servidor**. Fonte: [Open-Meteo](https://open-meteo.com/) (sem chave; João Pessoa −7,12 / −34,88; `lib/weather.ts`), buscada só no servidor, nunca no navegador, com cache de 30 min (`revalidate`). Qualquer falha (rede, status, formato, mais de 4 s) vira "sem clima": nada aparece e o resto da página segue igual. O nome do tempo ("Parcialmente nublado") só vai pra leitor de tela. **Crédito (CC BY 4.0):** "Weather data by Open-Meteo.com" (`contact.weather.credit`), link discreto embaixo do mapa, só quando há clima. O Open-Meteo pede atribuição por licença; o uso é não comercial e dentro do limite gratuito.
- O telefone não aparece em lugar nenhum.

## Atividade (GitHub, #28)

- Bloco curto antes do Contato (a seção Tecnologias ainda não existe no `main`; quando entrar, o bloco vai logo depois dela): `h2` "Atividade" em `--text-lead`, o total do ano em `--text-small` (`--soft`) e a grade de contribuições do último ano do usuário `caiomayan` (53 semanas × 7 dias, células de 11 px, vão de 3 px, cantos de 2 px). **Preto e branco:** os 5 níveis da API (`contributionLevel`) viram `--surface` (nenhuma) e `--ink` a 22 %, 45 %, 70 % e 100 % sobre `--bg`; a cor verde que a API manda é ignorada. Estilos em `app/dados.css`, componente `components/activity.tsx` (servidor), dados em `lib/github-activity.ts`.
- **Dados:** API GraphQL do GitHub (`contributionsCollection`), **só no servidor**, com o token da variável de ambiente `GITHUB_TOKEN` (um token fine-grained sem nenhuma permissão, só leitura pública; nunca vai pro cliente nem pro repositório e nunca é logado). Cache de 3 h. Sem token, ou com a API fora (rede, status, erro do GraphQL, formato, mais de 4 s), o bloco inteiro não aparece, sem erro. Nenhum dado novo é obrigatório pra página renderizar.
- **Celular:** a grade é mais larga que a tela, então rola **dentro do próprio bloco** (a página não rola de lado) e já abre nas semanas mais recentes (`direction: rtl` no contêiner, grade de volta a `ltr`). O contêiner tem `tabindex="0"` e nome (`role="img"`, `aria-label` com o total) pra teclado e leitor de tela. A grade é decorativa (`aria-hidden`); o total está em texto. Não anima nada; as partes entram como as das outras seções (`data-reveal-part`).

## Dados ao vivo nos testes (#28)

As duas APIs são lidas de `OPEN_METEO_URL` e `GITHUB_GRAPHQL_URL` (padrão: as reais). Os testes e2e apontam o build pra um servidor falso (`tests/fixtures/apis.mjs`) e fazem **dois builds**: um com as APIs respondendo (`.next`) e outro com as duas falhando (`.next-falha`, `NEXT_DIST_DIR`), testado como o projeto `apis-falhando` do Playwright. O token usado nos testes é do servidor falso. `npm run test:dados` cobre as buscas sem token e com a API fora, sem navegador. Portas trocáveis por `E2E_PORT`, `E2E_PORT_FALHA` e `E2E_PORT_APIS` (dois checkouts ao mesmo tempo).

## Experiência e formação

- Duas seções curtas (`h2` em `--text-lead`), em linhas de duas pontas: texto à esquerda, período à direita (no celular o período desce para baixo do texto). Sem bordas nem cartões.
- Logos reais (TechEduConnect, IFPB; o da TechEduConnect é o símbolo inteiro, `viewBox` ajustado ao desenho, sem o nome ao lado) **sem selo nem fundo**: aparecem direto sobre `--bg`. Os coloridos continuam coloridos; no tema escuro levam `filter: invert(1) hue-rotate(180deg)` (preto vira branco, as cores seguem as mesmas) pra ficarem legíveis. Onde não há logo (Hospital, Monitor, Inglês), entra um ícone de reserva do Lucide (`lucide-react`, registro em `lib/fallback-icons.ts`, componente `components/fallback-icon.tsx`), decorativo (`aria-hidden`), traço 1,75 em `--soft`, centrado na mesma coluna do logo (`--entry-logo`, mais `--entry-gap`). Regra: todo item de experiência, formação e stack tem logo OU ícone (o tipo `Mark` em `content/types.ts` impede os dois e impede nenhum). Estilos sob `#experiencia`/`#formacao`; a linha é um componente só (`components/entry-row.tsx`) e o logo vem de `content/` via `lib/org-logos.ts`.
- TechEduConnect: nome (link para o site da empresa, sublinhado em `--ink` no hover), cargo, descrição da empresa e as três linhas em texto corrido; o plugin de redações é só a primeira linha, sem destaque. Fonte do texto: `docs/copy-deck.md` → `content/` (`experience`, `education`).
- Os logos ficam em `assets/logos/` (cópias de `design/prototipo/assets/logos/`).

## Movimento

Estilo Apple: molas suaves, nada brusco. Os tokens vivem só em `app/motion.css`: `--ease` (`cubic-bezier(0.2, 0.7, 0.2, 1)`) e `--spring` (CSS `linear()` de uma mola com amortecimento 0,78, passa ~2% e assenta; sem suporte cai em `--ease`). Só `transform` e `opacity`, com uma exceção documentada: o traço da assinatura (`pathLength`, num SVG pequeno). Cor, fundo e sublinhado mudam sem transição (hover de links e botões é instantâneo na cor). Tudo desligado com `prefers-reduced-motion: reduce`; a página é completa e legível sem animação ou sem JavaScript.

- **Cores nos arquivos Satori.** A imagem de prévia (`lib/og-image.tsx`) e o ícone da aba (`app/icon.tsx`) não leem variáveis CSS; as cores do tema claro vêm de `lib/palette.ts` (só `bg`, `ink` e `soft`, sem acento). Esse módulo precisa acompanhar os tokens de `:root` em `app/globals.css`: mudou um, muda o outro. O ícone da aba é um ponto na cor do texto.
- **Assinatura** (`components/signature.tsx`, dados em `lib/signature.ts`): o nome "Caio Mayan" no canto superior esquerdo (é a assinatura do site, #18: o invólucro `.signature-mark` tem `role="img"` e `aria-label` = `hero.name`, e nunca fica escondido; o SVG dentro é `aria-hidden`), 40 px de altura, na cor do texto (`currentColor`, legível nos dois temas), se escreve letra a letra na abertura (0,2 s entre letras, 1 s por letra, ~2,9 s no total) com o pacote `motion` (traço do contorno + preenchimento revelado por máscara). É um traço estilizado, **não** a assinatura real do Caio. Com movimento reduzido aparece pronta; sem JavaScript aparece pronta também (`<noscript>` em `components/site-shell.tsx`). Os contornos vêm da fonte **Lastoria Bold** e ficam pré-gerados em `lib/signature.ts` por `npm run signature` (`scripts/generate-signature.mjs`, com opentype.js só como devDependency): a fonte é baixada pra `scripts/fonts/` (ignorada pelo git) e nunca vai pra `public/` nem pro navegador. **Licença da Lastoria não confirmada; o risco é assumido pelo Caio.** Créditos: o componente é adaptado do `Signature` do componentry.dev (MIT, © 2026 Harsh Jadhav; aviso no topo de `components/signature.tsx`), registry `https://componentry.dev/r/signature.json`; fonte `https://componentry.dev/LastoriaBoldRegular.otf`.
- **Primeira tela:** entrada escalonada de foto, título e frase (`rise`).
- **Seções:** as partes de cada seção entram em sequência (70 ms entre elas, até 5 passos), uma vez, ao chegar na tela (`components/reveal.tsx`; cada componente marca suas partes com `data-reveal-part`, e o estado vai em `data-reveal`, valores em `lib/reveal.ts`). O estado escondido é aplicado só pelo script e só ao que está abaixo da tela: se o script falhar, nada ficou escondido.
- **Tooltip** (`components/tooltip.tsx`): entra com fade e 4 px de deslocamento (`tip-in`, 140 ms, `--ease`, só `transform`/`opacity`), só sem movimento reduzido; some na hora. Fica fora do layout enquanto fechado (renderizado só aberto).
- **Rolagem suave** (`components/smooth-scroll.tsx`, [lenis.dev](https://lenis.dev), #18): só em ponteiro fino com hover (`(hover: hover) and (pointer: fine)`; no toque a rolagem é nativa), desligada com `prefers-reduced-motion` (liga e desliga se a preferência ou o ponteiro mudam com a página aberta). O Lenis só é baixado quando liga. Só interpreta a roda do mouse: teclado, barra de rolagem e busca da página seguem nativos, e a rolagem é a da janela, então as entradas ao rolar (`IntersectionObserver`) funcionam sem mudança. Links internos (`#carmine` etc.) são tratados no próprio componente: rolagem suave, endereço atualizado e foco no alvo (o próximo Tab parte dali). O CSS do pacote (`lenis/dist/lenis.css`) entra em `components/site-shell.tsx`.
- **Tema:** fade da página inteira pelo View Transitions (`document.startViewTransition`, 360 ms), só composição (`withViewTransition` em `lib/motion.ts`). Sem suporte a View Transitions no navegador, ou com movimento reduzido, a troca é instantânea (aceitável: é só o fade que se perde). No recarregamento não há fade.
- **Controles:** hover, foco e clique em todos (botões de tema e copiar com mola; links com sublinhado em `--ink` por `transform` e opacidade no clique). O fundo dos botões de tema e língua no hover/foco muda sem transição. Transições dos botões ficam sob `prefers-reduced-motion: no-preference`; o `.theme-toggle` é definido só em `app/globals.css`.
- **Preview do link do Carmine** (`components/hover-link-preview.tsx`, #21): no hover do link "stcarmine.com" um cartão com o print do site (192×112, arquivo 384×224 em `assets/carmine-preview.webp`, ~9 KB) segue o ponteiro com mola (posição 300/30, inclinação 300/20; o cartão fica 40 px acima do ponteiro, sempre dentro da janela) e inclina até 15° conforme o lado do link em que o ponteiro está (o ponto de partida do 21st.dev, mantido: assenta bem e passa ~1° do alvo). Entra e sai com fade e escala de 0,8 a 1. Só `transform` e `opacity`: o cartão é `position: fixed` num portal em `document.body`, e os valores vivem em *motion values* (sem re-render por quadro). Só com mouse (`(hover: hover) and (pointer: fine)`); no toque e no teclado não existe (o link é o mesmo). Com `prefers-reduced-motion: reduce` aparece e some, parado acima do link, sem mola, inclinação nem fade. É decorativo (`aria-hidden`, imagem com `alt=""`, sem texto): o nome do link continua "stcarmine.com". O print é do site no ar, primeira tela, e precisa mostrar o produto funcionando: pra atualizar, abrir o site num Chrome (1280×745), salvar e gerar o webp com `sharp` (cover, 384×224, qualidade ~78). Preto e branco: cartão em `--surface`, cantos de 12 px e `--shadow` só nele; o link mantém o estilo de sempre. Adaptado do HoverLinkPreview do 21st.dev (sem Tailwind, sem framer-motion).

## Acessibilidade

- Foco visível em todos os controles (contorno de 2 px na cor do texto). Botão de tema com 44 × 44 px e `aria-pressed`.
- Contraste do texto secundário (`--soft`) acima de 4,5:1 nos dois temas.

## Seção Carmine

- Logo depois da primeira tela: rótulo à esquerda (200 px: "Carmine" + "Projeto pessoal") e coluna de 640 px à direita (no celular, uma coluna só). Texto em `--text-body`/`--text-small`; o ponto de status é `--ink`.
- Sem prints, abas nem legenda (removidos em #18, junto com `assets/carmine/` e `components/carmine-shots.tsx`). O logo do Carmine continua no cabeçalho. A exceção é o preview do link "stcarmine.com" (só no hover do mouse, ver Movimento): não é um print fixo na página.
- Stack **só com ícones**, lado a lado (alvos de 44 px; logos em `assets/logos/`, registro em `lib/stack-logos.ts`), sem nome nem função na tela: a função de cada tecnologia saiu do copy deck e de `content/`. Cada ícone é focável pelo teclado (`role="img"` + `aria-label` com o nome) e abre o **tooltip** com o nome no hover e no foco (`components/tooltip.tsx`, o mesmo do contato; `aria-hidden`, pra o nome não ser lido duas vezes; Esc fecha). Logos monocromáticos invertem no tema escuro (o do Valkey é colorido e não inverte). Sem logo oficial (CounterStrikeSharp), ícone de reserva do Lucide (quebra-cabeça), 20 px, decorativo.

### Medidas da seção (tokens em `app/globals.css`)

| Token | Valor | Por quê |
|---|---|---|
| `--carmine-rail` | 200px | largura do rótulo à esquerda |
| `--carmine-gap` | 40px | espaço entre rótulo e coluna |
| `--carmine-column` | 640px | largura máxima da coluna |
| `--icon-ui` | 20px | ícones de contato, de copiar e-mail e do botão de tema |
| `--icon-entry` | 26px | ícone de reserva em experiência e formação (a coluna `--entry-logo` segue em 40px) |
| `--icon-stack` | 20px | logo ou ícone de reserva de cada item da stack |

Tamanho de ícone vive só nesses tokens (`app/globals.css`); os componentes não passam `size`. As dimensões de `<Image>` (`width`/`height`) são só a proporção do arquivo: o CSS manda.

- **Duas bibliotecas de ícones, de propósito.** `lucide-animated` (cópias em `components/icons/`, com `motion`) só nos controles que reagem ao toque: contato, copiar, tema. Os ícones de reserva são decorativos e parados, então ficam no `lucide-react`, que entra por ícone importado (sem `motion`, sem JavaScript de animação). Trocar tudo pra `lucide-animated` traria cópias e animação onde ninguém interage. Avaliado em 2026-11-09; mantido assim.
- **Cores nos arquivos Satori.** A imagem de prévia (`lib/og-image.tsx`) e o ícone da aba (`app/icon.tsx`) não leem variáveis CSS; as cores do tema claro vêm de `lib/palette.ts` (só `bg`, `ink` e `soft`, sem acento). Esse módulo precisa acompanhar os tokens de `:root` em `app/globals.css`: mudou um, muda o outro. O ícone da aba é um ponto na cor do texto.
- **Assinatura** (`components/signature.tsx`): a região da máscara de traço sai do `viewBox` de `lib/signature.ts`, e a espessura, do `fontSize`; um componente só (`Filled`) desenha as letras prontas nas duas versões.

- O logo do Carmine no cabeçalho tem 40 × 40 px (`width`/`height` da imagem, não do CSS).
- A seta `↗` dos links externos vem de `.link-external::after` (`content: " ↗" / ""`, sem texto alternativo). Ornamento, como o ponto do h1, e por isso fica fora de `content/`.
- Logos da stack: registro único em `lib/stack-logos.ts` (SVG em `assets/logos/` + uma linha no registro). O do Valkey é o oficial (`valkey-horizontal.svg` de valkey-io/valkey-website, só com o `viewBox` cortado no ícone e metadados do editor removidos); os demais são do Simple Icons.

## Medir performance

O Lighthouse local, com a máquina ocupada, dá números baixos e instáveis. A medida que vale é o PageSpeed Insights (pagespeed.web.dev) no site no ar ou no preview.
