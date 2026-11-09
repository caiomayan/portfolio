# DESIGN.md — caiomayan.com

Direção: **quiet instrument** (escolhida pelo Caio entre três protótipos; referência em `design/prototipo/`, só do visual, não do código). Tipografia e acabamento no espírito da Apple: títulos grandes com tracking negativo, muito espaço, superfícies separadas por tom (sem linhas), cantos e movimento suaves. Este arquivo descreve o que está no código; a fonte dos tokens é `app/globals.css`.

## Regras

- Um acento só (vermelho), usado em pouco: o ponto depois do título, a seleção de texto e, nas próximas tarefas, o ponto de status e os sublinhados.
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
| `--accent` | `#d92b21` | `#ff5a4f` |
| `--accent-ink` | `#ffffff` | `#0b0b0c` |
| `--shadow` | `0 1px 2px rgb(0 0 0 / 0.04), 0 12px 40px -12px rgb(0 0 0 / 0.18)` | `0 1px 2px rgb(0 0 0 / 0.4), 0 12px 40px -12px rgb(0 0 0 / 0.8)` |

`--accent-ink` é a cor do texto sobre o acento (hoje, a seleção de texto). `--shadow` é a sombra da foto, a única do site.
O site **abre sempre no claro**. O escuro é uma escolha do visitante (botão no topo), guardada em `localStorage` (`theme`) e aplicada por um script inline antes da primeira pintura (`data-theme="dark"` no `<html>`). O tema do sistema não é consultado.

## Primeira tela

- Foto original inteira (quadrado, sem corte), cantos de 28 px, 360 px no desktop; no celular fica pequena ao lado do nome e da cidade.
- Título (h1) em `--text-display` (até 104 px), peso 700, tracking −0,045em, com o ponto final em acento. Esse ponto é ornamento tipográfico, não texto: vem de `h1::after` (`content: "." / ""`, sem texto alternativo, então leitores de tela não o leem) e fica fora de `content/` de propósito, porque o título do copy deck não tem ponto e a frase de abertura (`openingLine`) o monta como "título. lead". Frase de abertura em `--text-lead`, cor `--soft`.
- No canto superior esquerdo fica a assinatura (ver Movimento); no canto superior direito ficam o link de língua (pílula de 44 px de altura em `--surface`, com o nome da outra língua: "English" / "Português", texto vindo de `ui.otherLang` em `content/`; é um link comum pra rota equivalente, sem script e sem escolha automática por língua do navegador) e, ao lado, o botão de tema. O `hreflang` entre `/` e `/en` sai de `lib/page-metadata.ts` (`alternates.languages`).

## Contato

- Última seção: título "Contato" (`h2`, em `--soft`), e-mail em `--text-lead` com botão de copiar ao lado (círculo de 44 px em `--surface`, só ícone, `aria-label`, foco visível). Ao copiar, o ícone vira o de confirmado por 2 s e uma região `role="status"` (só pra leitor de tela) anuncia "Copiado".
- Abaixo, LinkedIn, GitHub e Currículo (PDF) com ícone. O link do PDF só aparece se a língua tem arquivo (`contact.resume` em `content/`).
- Ícones de interface: **lucide-animated** (registry `https://lucide-animated.com/r/<nome>.json`), copiados em `components/icons/` sem alteração (dependência `motion`). Animam no hover, no foco e no clique, disparados por `components/contact.tsx` e `theme-toggle.tsx`; com `prefers-reduced-motion` ficam parados (`lib/motion.ts`). O botão de tema também usa Sun/Moon do lucide-animated.
- O telefone não aparece em lugar nenhum.

## Experiência e formação

- Duas seções curtas (`h2` em `--text-lead`), em linhas de duas pontas: texto à esquerda, período à direita (no celular o período desce para baixo do texto). Sem bordas nem cartões.
- Logos reais só onde existem: TechEduConnect (marca) e IFPB, em selo branco de cantos suaves (funciona nos dois temas). O Hospital fica só com o nome; as linhas sem logo reservam a mesma coluna (`--entry-logo`, 40 px, mais `--entry-gap`) para alinhar o texto; o selo usa o token `--plate`. Os estilos ficam sob `#experiencia`/`#formacao`; a linha é um componente só (`components/entry-row.tsx`) e o logo vem de `content/` via `lib/org-logos.ts`.
- TechEduConnect: nome (link para o site da empresa, sublinhado em acento no hover), cargo, descrição da empresa e as três linhas em texto corrido; o plugin de redações é só a primeira linha, sem destaque. Fonte do texto: `docs/copy-deck.md` → `content/` (`experience`, `education`).
- Os logos ficam em `assets/logos/` (cópias de `design/prototipo/assets/logos/`).

## Movimento

Estilo Apple: molas suaves, nada brusco. Os tokens vivem em `app/motion.css`: `--ease` (`cubic-bezier(0.2, 0.7, 0.2, 1)`) e `--spring` (CSS `linear()` de uma mola com amortecimento 0,78, passa ~2% e assenta; sem suporte cai em `--ease`). Só `transform` e `opacity`, com duas exceções pedidas: o traço da assinatura (`stroke-dashoffset`, num SVG pequeno) e a cor do tema (ver abaixo). Tudo desligado com `prefers-reduced-motion: reduce`; a página é completa e legível sem animação ou sem JavaScript.

- **Assinatura** (`components/signature.tsx`, dados em `lib/signature.ts`): o nome "Caio Mayan" no canto superior esquerdo, 40 px de altura, se escreve na abertura (~2 s, um traço por vez, da esquerda pra direita). É um traço estilizado, **não** a assinatura real do Caio: vem da fonte de linha única *Hershey Script 1-stroke* (Hershey Fonts, domínio liberal: uso livre com os créditos de A. V. Hershey, U. S. National Bureau of Standards, e de James Hurt, Cognition, Inc., conforme a licença da distribuição), com cada linha suavizada em curvas de Bézier. Os caminhos ficam commitados; nada é carregado em tempo de execução. `aria-hidden` (o nome já está no texto). Com movimento reduzido aparece pronta.
- **Primeira tela:** entrada escalonada de foto, título e frase (`rise`).
- **Seções:** as partes de cada seção entram em sequência (70 ms entre elas, até 5 passos), uma vez, ao chegar na tela (`components/reveal.tsx`, lista de alvos nele). O estado escondido é aplicado só pelo script e só ao que está abaixo da tela: se o script falhar, nada ficou escondido.
- **Prints do Carmine:** todos empilhados na mesma célula; a troca é um fade com leve escala (`.frame[data-active]`). O print que sai deixa a árvore de acessibilidade na hora (`aria-hidden` + `inert`) e some da tela depois do fade.
- **Tema:** fade da página inteira pelo View Transitions (`document.startViewTransition`, 360 ms), só composição; sem suporte ou com movimento reduzido, troca na hora. No recarregamento não há fade.
- **Controles:** hover, foco e clique em todos (botões de tema e copiar e abas com mola; links com sublinhado em acento por `transform` e opacidade no clique).

## Acessibilidade

- Foco visível em todos os controles (contorno de 2 px na cor do texto). Botão de tema com 44 × 44 px e `aria-pressed`.
- Contraste do texto secundário (`--soft`) acima de 4,5:1 nos dois temas.

## Seção Carmine

- Logo depois da primeira tela: rótulo à esquerda (200 px: "Carmine" + "Projeto pessoal") e coluna de 640 px à direita (no celular, uma coluna só). Texto em `--text-body`/`--text-small`; o único acento é o ponto de status.
- Prints reais do stcarmine.com (`assets/carmine/`, 1280 × 800, tirados em 2026-11-09: catálogo de itens do Inventário e Ranking semanal; a tela inicial fica de fora porque hoje mostra os servidores dormindo). A moldura tem a largura da coluna (proporção 8:5, canto 12 px); nunca estica além dela. Refazer os prints quando o produto mudar.
- Abas em pílula (`role="tablist"`): clique, setas, Home e End trocam o print; só a aba ativa entra na ordem de Tab. A troca é um fade (ver Movimento).
- Stack em lista de duas pontas (nome + papel); logos em `assets/logos/` (registro em `lib/stack-logos.ts`), invertidas no tema escuro (a do Valkey é colorida e não inverte). Sem logo oficial (CounterStrikeSharp), só o nome.

### Medidas da seção (tokens em `app/globals.css`)

| Token | Valor | Por quê |
|---|---|---|
| `--carmine-rail` | 200px | largura do rótulo à esquerda |
| `--carmine-gap` | 40px | espaço entre rótulo e coluna |
| `--carmine-column` | 640px | largura máxima da coluna; também a do print |
| `--stack-row` | 52px | altura mínima de cada linha da stack (logo de 20px + respiro) |

- O logo do Carmine no cabeçalho tem 40 × 40 px (`width`/`height` da imagem, não do CSS).
- A seta `↗` dos links externos vem de `.link-external::after` (`content: " ↗" / ""`, sem texto alternativo). Ornamento, como o ponto do h1, e por isso fica fora de `content/`.
- Logos da stack: registro único em `lib/stack-logos.ts` (SVG em `assets/logos/` + uma linha no registro). O do Valkey é o oficial (`valkey-horizontal.svg` de valkey-io/valkey-website, só com o `viewBox` cortado no ícone e metadados do editor removidos); os demais são do Simple Icons.
