import { content } from "@/content";
import { llms } from "@/content/llms";
import { langs, locales } from "@/lib/locales";
import { absoluteUrl, REPO_URL } from "@/lib/site";

// Estático: gerado no build a partir de `content/`.
export const dynamic = "force-static";

export function GET() {
  const en = content.en;
  const text = [
    `# ${en.hero.name}`,
    `> ${en.hero.title}. ${en.hero.lead}`,
    llms.intro.replace("{city}", en.hero.place.city),
    `## ${llms.versionsHeading}`,
    langs.map((l) => `- [${locales[l].name}](${absoluteUrl(locales[l].path)}): ${llms.versions[l]}`).join("\n"),
    `## ${llms.elsewhereHeading}`,
    [`- [GitHub](${en.contact.github.href})`, `- [LinkedIn](${en.contact.linkedin.href})`, `- [${llms.repoLabel}](${REPO_URL})`].join("\n"),
  ].join("\n\n");
  return new Response(`${text}\n`, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
