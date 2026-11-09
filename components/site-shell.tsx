import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import type { ReactNode } from "react";
import type { Lang } from "@/content";
import { locales } from "@/lib/locales";
import { Reveal } from "@/components/reveal";
import { SmoothScroll } from "@/components/smooth-scroll";
import "lenis/dist/lenis.css";
import "@/app/globals.css";
import "@/app/motion.css";

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
        {children}
        <Reveal />
        <SmoothScroll />
        {/* Sem JavaScript a assinatura não é desenhada: aparece pronta (é o nome do site). */}
        <noscript>
          <style>{`.signature[data-static]{visibility:visible}`}</style>
        </noscript>
        {/* Vercel Web Analytics (sem cookies). Só no deploy da Vercel: fora dela o script não existe e daria 404. */}
        {process.env.VERCEL && <Analytics />}
      </body>
    </html>
  );
}
