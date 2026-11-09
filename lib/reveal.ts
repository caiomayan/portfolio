/**
 * Entrada escalonada das seções (components/reveal.tsx, estilos em app/motion.css).
 * Cada parte que entra é marcada no próprio componente com o atributo `data-reveal-part`;
 * o estado fica em `data-reveal`, com os valores abaixo. O CSS repete os dois valores
 * (`[data-reveal="pending"]`, `[data-reveal="in"]`): se mudar aqui, mude lá.
 */
export const REVEAL_PART_SELECTOR = "[data-reveal-part]";
export const REVEAL_STATE = { hidden: "pending", shown: "in" } as const;
