import Image from "next/image";
import type { Content } from "@/content";
import carmineLogo from "@/assets/logos/carmine.svg";
import { IconRow } from "./icon-row";
import { HoverLinkPreview } from "./hover-link-preview";
import carminePreview from "@/assets/carmine-preview.webp";

export function CarmineSection({ content }: { content: Content["carmine"] }) {
  return (
    <section id="carmine" aria-labelledby="carmine-title">
      <div className="carmine-head" data-reveal-part>
        {/* Mesmo título das outras seções (h2 grande); o logo vem antes do nome, decorativo. */}
        <h2 id="carmine-title">
          <Image src={carmineLogo} alt="" width={40} height={40} unoptimized />
          {content.heading}
        </h2>
        <p className="carmine-note">{content.note}</p>
      </div>
      <div className="carmine-body">
        <p data-reveal-part>{content.what}</p>
        <p data-reveal-part>{content.how}</p>
        <p className="status" data-reveal-part><span className="status-dot" aria-hidden="true" />{content.status}</p>

        <IconRow list={content.stack} data-reveal-part />

        <div className="links" data-reveal-part>
          <HoverLinkPreview className="link-external" href={content.links.site.href} image={carminePreview}>{content.links.site.label}</HoverLinkPreview>
          <a className="link-external" href={content.links.repo.href}>{content.links.repo.label}</a>
        </div>
      </div>
    </section>
  );
}
