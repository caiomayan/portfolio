/**
 * Endereço de uma API externa (#28). O token do GitHub vai junto na chamada, então um valor errado na Vercel
 * não pode mandá-lo pra outro host. A troca por variável de ambiente só vale com `ALLOW_TEST_API_URLS=1`
 * (ligada só pelo CI e pelos testes, que apontam pro servidor falso) e nunca em produção da Vercel.
 * Fora disso, sempre o host oficial.
 */
export function apiUrl(override: string | undefined, official: string): string {
  const allowed = process.env.ALLOW_TEST_API_URLS === "1" && process.env.VERCEL_ENV !== "production";
  return allowed && override ? override : official;
}
