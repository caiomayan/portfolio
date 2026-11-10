import { Education } from "@/components/education";
import { Experience } from "@/components/experience";
import { Foundations } from "@/components/foundations";
import { Contact } from "@/components/contact";
import { ContactLanguages } from "@/components/contact-languages";
import { CarmineSection } from "@/components/carmine-section";
import { Hero, SiteHeader } from "@/components/hero";
import { SiteFooter } from "@/components/site-footer";
import { Activity } from "@/components/activity";
import { weatherSlots } from "@/components/weather";
import { content } from "@/content";
import { getActivity } from "@/lib/github-activity";
import { pageMetadata } from "@/lib/page-metadata";
import { getWeather } from "@/lib/weather";

export const metadata = pageMetadata("pt");

// Cache da página: o clima (30 min) manda; o GitHub tem cache de dados próprio, mais longo (lib/github-activity.ts).
export const revalidate = 1800;

export default async function Page() {
  const [weather, activity] = await Promise.all([getWeather(), getActivity()]);
  const clima = weatherSlots(weather, content.pt.contact.weather);
  return (
    <>
      <SiteHeader content={content.pt} />
      <main>
        <Hero content={content.pt} weather={clima} />
        <CarmineSection content={content.pt.carmine} />
        <Experience content={content.pt} />
        <Education content={content.pt} />
        <Foundations content={content.pt} />
        <Activity content={content.pt.activity} data={activity} lang="pt" />
        <Contact content={content.pt}>
          <ContactLanguages languages={content.pt.contact.languages} />
        </Contact>
      </main>
      {/* Crédito do Open-Meteo (CC BY 4.0) à direita do rodapé, só quando há clima. */}
      <SiteFooter footer={content.pt.footer} credit={clima?.credit} />
    </>
  );
}
