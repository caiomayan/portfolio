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
- O canto superior esquerdo fica livre para a assinatura (tarefa futura); o botão de tema fica no canto superior direito.

## Movimento

- Só `transform` e `opacity` (mais a cor do tema no `body`). Curva `cubic-bezier(0.2, 0.7, 0.2, 1)`, 160–700 ms.
- Entrada escalonada da primeira tela (foto, título, frase) e troca de ícone do botão de tema.
- Tudo desligado com `prefers-reduced-motion: reduce`; a página é completa e legível sem animação.

## Acessibilidade

- Foco visível em todos os controles (contorno de 2 px na cor do texto). Botão de tema com 44 × 44 px e `aria-pressed`.
- Contraste do texto secundário (`--soft`) acima de 4,5:1 nos dois temas.
