import type { Content } from "@/content";
import { EntryRow } from "./entry-row";

export function Experience({ content }: { content: Content }) {
  const { heading, jobs } = content.experience;
  return (
    <section id="experiencia" className="entries" aria-labelledby="experiencia-title">
      <h2 id="experiencia-title" data-reveal-part>{heading}</h2>
      <ul>
        {jobs.map((job) => (
          <EntryRow key={job.company} title={job.company} titleUrl={job.companyUrl} sub={job.role} about={job.about} lines={job.lines} period={job.period} logo={job.logo} />
        ))}
      </ul>
    </section>
  );
}
