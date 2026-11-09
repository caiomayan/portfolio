import type { MetadataRoute } from "next";
import { languageAlternates, locales } from "@/lib/locales";
import { absoluteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const languages = languageAlternates(absoluteUrl);
  return Object.values(locales).map((l) => ({ url: absoluteUrl(l.path), alternates: { languages } }));
}
