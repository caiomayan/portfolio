/** Texto pro `<script type="application/ld+json">`: o `<` sai escapado (`\\u003c`, com duas barras na fonte, pra ficar a sequência literal no texto), pra nenhum valor fechar a tag antes da hora. */
export const jsonLdText = (data: object): string => JSON.stringify(data).replace(/</g, "\\u003c");
