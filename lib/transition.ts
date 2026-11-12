/**
 * Transição da primeira tela para o resto da página (#39, rodada 4), PRÉVIA: duas variantes escolhidas por `?transicao=recuo` (o padrão) ou
 * `?transicao=folha`, pra o Caio decidir. Depois da escolha, a perdedora sai antes do merge (este arquivo, o parâmetro e os blocos marcados "TRANSIÇÃO A"
 * e "TRANSIÇÃO B" em app/motion.css e lib/choreography.ts).
 * O script inline lê o parâmetro antes da primeira pintura e põe `data-transicao="folha"` no <html> (a folha é CSS e precisa valer desde o primeiro quadro, sem
 * pulo de layout quando o GSAP chega). Sem o parâmetro, nada é posto (= recuo). O atributo fica na sessão da página, como o `data-theme`: trocar de idioma
 * (que tira o parâmetro do endereço) não muda a variante.
 */
export const transitionScript = `try{if(new URLSearchParams(location.search).get("transicao")==="folha")document.documentElement.dataset.transicao="folha"}catch(e){}`;
