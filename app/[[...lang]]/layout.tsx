import { notFound } from "next/navigation";
import { SiteShell } from "@/components/site-shell";
import { langFromParams, langStaticParams } from "@/lib/locales";

// Uma raiz só, pras três rotas (/, /en, /es): trocar de língua é navegação dentro do mesmo layout raiz, sem recarregar. Só essas três existem.
export const dynamicParams = false;
export const generateStaticParams = langStaticParams;

export default async function Layout({ children, params }: LayoutProps<"/[[...lang]]">) {
  const lang = langFromParams((await params).lang);
  if (!lang) notFound();
  return <SiteShell lang={lang}>{children}</SiteShell>;
}
