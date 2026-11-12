import { locales } from "@/lib/locales";
import "./globals.css";

export const metadata = { title: "Caio Mayan" }; // #46: a 404 tem o mesmo título de aba das páginas

// 404 global (sem layout raiz comum). Sem texto de conteúdo: só o essencial.
export default function GlobalNotFound() {
  return (
    <html lang={locales.pt.htmlLang}>
      <body>
        <main className="notfound">
          <h1>404</h1>
        </main>
      </body>
    </html>
  );
}
