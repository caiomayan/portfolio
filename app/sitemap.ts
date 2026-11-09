import type { MetadataRoute } from "next";
import { locales } from "@/lib/locales";
import { SITE_URL } from "@/lib/site";

const abs = (path: string) => (path === "/" ? SITE_URL : `${SITE_URL}${path}`);

export default function sitemap(): MetadataRoute.Sitemap {
  const languages = { [locales.pt.hreflang]: abs(locales.pt.path), [locales.en.hreflang]: abs(locales.en.path) };
  return [locales.pt, locales.en].map((l) => ({ url: abs(l.path), alternates: { languages } }));
}
