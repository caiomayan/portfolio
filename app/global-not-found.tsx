import "./globals.css";

// 404 global (sem layout raiz comum). Sem texto de conteúdo: só o essencial.
export default function GlobalNotFound() {
  return (
    <html lang="pt-BR">
      <body>
        <main className="notfound">
          <h1>404</h1>
        </main>
      </body>
    </html>
  );
}
