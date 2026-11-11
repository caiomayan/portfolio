/**
 * Parallax (#39, components/parallax.tsx): cada camada marca `data-parallax="<fator>"`. O deslocamento é só vertical, pela propriedade
 * `translate` (da família de transform; compõe com o `transform` da entrada e do `rise`), e fica em poucas dezenas de px.
 * Sem `data-parallax-from="top"` o fator age sobre a distância ao centro da janela (seções); com ele, sobre a rolagem desde o topo (primeira tela:
 * deslocamento zero em scrollY = 0, então nada se mexe no carregamento).
 * Fator positivo: a camada anda mais devagar que a página (parece mais longe). Negativo: mais rápido.
 */
export const PARALLAX_PHOTO = 0.08;
export const PARALLAX_MAP = 0.14;
export const PARALLAX_TITLE = 0.06;
/** Teto do deslocamento, em px, pra nenhuma camada sair do lugar além do sutil. */
export const PARALLAX_MAX_PX = 36;

/** Deslocamento de uma camada. `distance`: rolagem desde o topo (from="top") ou distância do centro da camada ao centro da janela. */
export function parallaxOffset(distance: number, factor: number, fromTop: boolean): number {
  const raw = fromTop ? distance * factor : -distance * factor;
  return Math.max(-PARALLAX_MAX_PX, Math.min(PARALLAX_MAX_PX, raw));
}
