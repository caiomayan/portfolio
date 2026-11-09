import { Inter } from "next/font/google";
import type { ReactNode } from "react";
import { langs, type Lang } from "@/content";
import "@/app/globals.css";

// Inter variável com eixo de tamanho óptico (opsz); servida pelo próprio site.
const inter = Inter({ subsets: ["latin"], axes: ["opsz"], variable: "--font-inter", display: "swap" });

// Aplica o tema salvo antes da primeira pintura (sem piscar). O padrão é o claro.
const themeScript = `try{if(localStorage.getItem("theme")==="dark")document.documentElement.dataset.theme="dark"}catch(e){}`;

export function SiteShell({ lang, children }: { lang: Lang; children: ReactNode }) {
  return (
    <html lang={langs[lang].htmlLang} className={inter.variable} suppressHydrationWarning>
      <body>
        {/* Antes de qualquer conteúdo: o tema já está aplicado na primeira pintura. */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        {children}
      </body>
    </html>
  );
}
