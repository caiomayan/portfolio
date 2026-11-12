import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import type { ReactNode } from "react";
import type { Lang } from "@/content";
import { openingFlightScript, openingScript } from "@/lib/opening";
import { transitionScript } from "@/lib/transition";
import { locales } from "@/lib/locales";
import { Choreography } from "@/components/choreography";
import { Opening } from "@/components/opening";
import { SmoothScroll } from "@/components/smooth-scroll";
import { ThemeKeeper } from "@/components/theme-keeper";
import "lenis/dist/lenis.css";
import "@/app/globals.css";
import "@/app/motion.css";
import "@/app/dados.css";

// Inter variável com eixo de tamanho óptico (opsz); servida pelo próprio site.
const inter = Inter({ subsets: ["latin"], axes: ["opsz"], variable: "--font-inter", display: "swap" });

// Aplica o tema salvo antes da primeira pintura (sem piscar). O padrão é o claro.
const themeScript = `try{if(localStorage.getItem("theme")==="dark")document.documentElement.dataset.theme="dark"}catch(e){}`;

export function SiteShell({ lang, children }: { lang: Lang; children: ReactNode }) {
  return (
    <html lang={locales[lang].htmlLang} className={inter.variable} suppressHydrationWarning>
      <body>
        {/* Antes de qualquer conteúdo: o tema já está aplicado na primeira pintura. */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        {/* #39: decide, antes da primeira pintura, se a abertura roda nesta visita (uma vez por aba). Sem JavaScript nada é escondido. */}
        <script dangerouslySetInnerHTML={{ __html: transitionScript }} />
        <script dangerouslySetInnerHTML={{ __html: openingScript }} />
        <Opening />
        {children}
        {/* #39: o voo, o fade e o pular da abertura, sem esperar a hidratação (a cobertura e a assinatura do topo já estão no DOM). */}
        <script dangerouslySetInnerHTML={{ __html: openingFlightScript }} />
        <ThemeKeeper />
        <Choreography />
        <SmoothScroll />
        {/* Vercel Web Analytics (sem cookies). Só no deploy da Vercel: fora dela o script não existe e daria 404. */}
        {process.env.VERCEL && <Analytics />}
      </body>
    </html>
  );
}
