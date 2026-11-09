/** Origem pública do site: só serve pra montar URLs absolutas (metadataBase, hreflang). Sem barra no final. */
export const SITE_URL = "https://caiomayan.com";

/** URL absoluta de uma rota do site ("/" vira a origem, sem barra no final). */
export const absoluteUrl = (path: string) => (path === "/" ? SITE_URL : `${SITE_URL}${path}`);
