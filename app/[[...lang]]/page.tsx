import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Activity } from "@/components/activity";
import { CarmineSection } from "@/components/carmine-section";
import { Education } from "@/components/education";
import { Experience } from "@/components/experience";
import { Foundations } from "@/components/foundations";
import { Hero, SiteHeader } from "@/components/hero";
import { Languages } from "@/components/languages";
import { SiteFooter } from "@/components/site-footer";
import { weatherSlots } from "@/components/weather";
import { content } from "@/content";
import { getActivity } from "@/lib/github-activity";
import { langFromParams } from "@/lib/locales";
import { pageMetadata } from "@/lib/page-metadata";
import { getWeather } from "@/lib/weather";

type Props = PageProps<"/[[...lang]]">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const lang = langFromParams((await params).lang);
  if (!lang) notFound();
  return pageMetadata(lang);
}

// Cache da página: o clima (30 min) manda; o GitHub tem cache de dados próprio, mais longo (lib/github-activity.ts).
export const revalidate = 1800;

export default async function Page({ params }: Props) {
  const lang = langFromParams((await params).lang);
  if (!lang) notFound();
  const page = content[lang];
  const [weather, activity] = await Promise.all([getWeather(), getActivity()]);
  const clima = weatherSlots(weather, page.weather);
  return (
    <>
      <SiteHeader content={page} lang={lang} />
      <main>
        <Hero content={page} weather={clima} />
        <CarmineSection content={page.carmine} />
        <Experience content={page} />
        <Education content={page} />
        <Foundations content={page} />
        <Activity content={page.activity} data={activity} lang={lang} />
        <Languages languages={page.languages} />
      </main>
      {/* Crédito do Open-Meteo (CC BY 4.0) à direita do rodapé, só quando há clima. */}
      <SiteFooter footer={page.footer} credit={clima?.credit} />
    </>
  );
}
