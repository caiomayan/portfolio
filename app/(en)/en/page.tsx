import { Education } from "@/components/education";
import { Experience } from "@/components/experience";
import { Foundations } from "@/components/foundations";
import { Contact } from "@/components/contact";
import { ContactLanguages } from "@/components/contact-languages";
import { CarmineSection } from "@/components/carmine-section";
import { Hero } from "@/components/hero";
import { SiteFooter } from "@/components/site-footer";
import { Activity } from "@/components/activity";
import { weatherSlots } from "@/components/weather";
import { content } from "@/content";
import { getActivity } from "@/lib/github-activity";
import { pageMetadata } from "@/lib/page-metadata";
import { getWeather } from "@/lib/weather";

export const metadata = pageMetadata("en");

// Cache da página: o clima (30 min) manda; o GitHub tem cache de dados próprio, mais longo (lib/github-activity.ts).
export const revalidate = 1800;

export default async function Page() {
  const [weather, activity] = await Promise.all([getWeather(), getActivity()]);
  const clima = weatherSlots(weather, content.en.contact.weather);
  return (
    <>
      <Hero content={content.en} weather={clima} />
      <CarmineSection content={content.en.carmine} />
      <Experience content={content.en} />
      <Education content={content.en} />
      <Foundations content={content.en} />
      <Activity content={content.en.activity} data={activity} lang="en" />
      <Contact content={content.en}>
        <ContactLanguages languages={content.en.contact.languages} />
      </Contact>
      {/* Crédito do Open-Meteo (CC BY 4.0) à direita do rodapé, só quando há clima. */}
      <SiteFooter footer={content.en.footer} credit={clima?.credit} />
    </>
  );
}
