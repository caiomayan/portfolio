import { Hero } from "@/components/hero";
import { content } from "@/content";
import { pageMetadata } from "@/lib/page-metadata";

export const metadata = pageMetadata("en");

export default function Page() {
  return <Hero content={content.en} />;
}
