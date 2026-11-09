/**
 * Cores do tema claro para os arquivos Satori (imagem de prévia e ícone da aba), que não leem variáveis CSS.
 * Precisa acompanhar os tokens de app/globals.css (`:root`): mudou lá, muda aqui (ver DESIGN.md).
 */
export const palette = {
  bg: "#fbfbfd", // --bg
  ink: "#1d1d1f", // --ink
  soft: "#6e6e73", // --soft
} as const;
