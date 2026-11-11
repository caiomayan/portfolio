import { langs, type Lang } from "@/lib/locales";
import { ogImage } from "@/lib/og-image";

// Imagem de prévia (Open Graph e Twitter) de cada língua, gerada no build: /og/pt, /og/en, /og/es. Fica fora da rota das páginas
// porque o Next não aceita a convenção opengraph-image depois de um segmento opcional (`[[...lang]]`).
export const dynamic = "force-static";
export const dynamicParams = false;
export const generateStaticParams = () => langs.map((lang) => ({ lang }));

export async function GET(_request: Request, { params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  return ogImage(lang as Lang);
}
