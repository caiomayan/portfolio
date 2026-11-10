import Image from "next/image";
import type { Content } from "@/content";
import carmineLogo from "@/assets/logos/carmine.svg";
import { StackIcons } from "./stack-icons";
import { HoverLinkPreview } from "./hover-link-preview";
import carminePreview from "@/assets/carmine-preview.webp";

export function CarmineSection({ content }: { content: Content["carmine"] }) {
  return (
    <section id="carmine" aria-labelledby="carmine-title">
      <div className="carmine-aside" data-reveal-part>
        <h2 id="carmine-title">{content.heading}</h2>
        <p className="carmine-aside-note">{content.note}</p>
      </div>
      <div className="carmine-body">
        <p className="status" data-reveal-part><span className="status-dot" aria-hidden="true" />{content.status}</p>
        <div className="project-head" data-reveal-part>
          <Image src={carmineLogo} alt="" width={40} height={40} unoptimized />
          <span className="project-name">{content.name}</span>
        </div>
        <p data-reveal-part>{content.what}</p>
        <p className="soft" data-reveal-part>{content.how}</p>

        <h3 className="label" data-reveal-part>{content.stackLabel}</h3>
        <StackIcons items={content.stack} data-reveal-part />

        <div className="links" data-reveal-part>
          <HoverLinkPreview className="link-external" href={content.links.site.href} image={carminePreview}>{content.links.site.label}</HoverLinkPreview>
          <a className="link-external" href={content.links.repo.href}>{content.links.repo.label}</a>
        </div>
      </div>
    </section>
  );
}
