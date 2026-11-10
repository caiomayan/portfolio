import { Education } from "@/components/education";
import { Experience } from "@/components/experience";
import { Technologies } from "@/components/technologies";
import { Contact } from "@/components/contact";
import { CarmineSection } from "@/components/carmine-section";
import { Hero } from "@/components/hero";
import { content } from "@/content";
import { pageMetadata } from "@/lib/page-metadata";

export const metadata = pageMetadata("en");

export default function Page() {
  return (
    <>
      <Hero content={content.en} />
      <CarmineSection content={content.en.carmine} />
      <Experience content={content.en} />
      <Education content={content.en} />
      <Technologies content={content.en} />
      <Contact content={content.en} />
    </>
  );
}
