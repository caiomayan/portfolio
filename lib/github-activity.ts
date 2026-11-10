/**
 * Contribuições do último ano do usuário `caiomayan` (API GraphQL do GitHub, `contributionsCollection`).
 * Roda só no servidor e lê o token de `GITHUB_TOKEN` (nunca vai pro cliente nem pro repositório; nunca é logado).
 * Sem token, ou com qualquer falha (rede, status, erro do GraphQL, formato), devolve `null` e o bloco não aparece.
 */

export type Level = 0 | 1 | 2 | 3 | 4;
export type Activity = { total: number; weeks: { count: number; level: Level }[][] };

export const ACTIVITY_REVALIDATE_SECONDS = 3 * 60 * 60;
const DEFAULT_URL = "https://api.github.com/graphql";
const LOGIN = "caiomayan";
const TIMEOUT_MS = 4000;

const QUERY = `query($login: String!) {
  user(login: $login) {
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks { contributionDays { contributionCount contributionLevel } }
      }
    }
  }
}`;

const LEVELS: Record<string, Level> = { NONE: 0, FIRST_QUARTILE: 1, SECOND_QUARTILE: 2, THIRD_QUARTILE: 3, FOURTH_QUARTILE: 4 };

type Day = { contributionCount?: unknown; contributionLevel?: unknown };

/** Valida a resposta e devolve só o que o bloco usa (a cor que a API manda é ignorada: o site é preto e branco). */
export function parseActivity(json: unknown): Activity | null {
  const calendar = (json as { data?: { user?: { contributionsCollection?: { contributionCalendar?: { totalContributions?: unknown; weeks?: unknown } } } } })?.data?.user
    ?.contributionsCollection?.contributionCalendar;
  if (!calendar || typeof calendar.totalContributions !== "number" || !Array.isArray(calendar.weeks) || calendar.weeks.length === 0) return null;
  const weeks: Activity["weeks"] = [];
  for (const week of calendar.weeks as { contributionDays?: Day[] }[]) {
    if (!Array.isArray(week?.contributionDays)) return null;
    const days: Activity["weeks"][number] = [];
    for (const d of week.contributionDays) {
      const level = typeof d?.contributionLevel === "string" ? LEVELS[d.contributionLevel] : undefined;
      if (typeof d?.contributionCount !== "number" || level === undefined) return null;
      days.push({ count: d.contributionCount, level });
    }
    weeks.push(days);
  }
  return { total: calendar.totalContributions, weeks };
}

export async function getActivity(): Promise<Activity | null> {
  const token = process.env.GITHUB_TOKEN?.trim();
  if (!token) return null;
  try {
    const res = await fetch(process.env.GITHUB_GRAPHQL_URL || DEFAULT_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", "User-Agent": "caiomayan.com" },
      body: JSON.stringify({ query: QUERY, variables: { login: LOGIN } }),
      next: { revalidate: ACTIVITY_REVALIDATE_SECONDS },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) return null;
    return parseActivity(await res.json());
  } catch {
    return null;
  }
}
