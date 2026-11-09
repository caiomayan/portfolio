import { Hero } from "@/components/hero";
import { content } from "@/content";
import { pageMetadata } from "@/lib/page-metadata";

export const metadata = pageMetadata("pt");

export default function Page() {
  return <Hero content={content.pt} />;
}
