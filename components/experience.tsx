import type { Content } from "@/content";
import { PARALLAX_TITLE } from "@/lib/parallax";
import { EntryRow } from "./entry-row";

export function Experience({ content }: { content: Content }) {
  const { heading, jobs } = content.experience;
  return (
    <section id="experiencia" className="entries" aria-labelledby="experiencia-title">
      <h2 id="experiencia-title" data-reveal-part data-parallax={PARALLAX_TITLE}>{heading}</h2>
      <ul>
        {jobs.map((job) => (
          <EntryRow key={job.company} title={job.company} titleUrl={job.companyUrl} role={job.role} about={job.about} lines={job.lines} stack={job.stack} period={job.period} logo={job.logo} icon={job.icon} />
        ))}
      </ul>
    </section>
  );
}
