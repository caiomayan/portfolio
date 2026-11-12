import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

// CSP (#45). A página é estática, então nada de nonce (forçaria renderização dinâmica). Hashes pros scripts inline também não servem:
// o Next injeta scripts do payload RSC (`self.__next_f.push([...])`) com conteúdo que muda por rota e por build, e não há gancho pra hashear no build.
// Por isso `script-src` aceita `'unsafe-inline'`; o ganho vem das outras diretivas (sem plugin, sem iframe, sem base trocada, sem formulário pra fora,
// imagens, fontes e conexões só do próprio site). `style-src` também precisa de `'unsafe-inline'`: GSAP, Lenis e o Next escrevem `style` inline.
// Sem `upgrade-insecure-requests` (quebraria o teste em http://localhost); a Vercel já força HTTPS. Em dev o React precisa de `eval`.
// O HSTS já vem da Vercel (`max-age=63072000`), então não é repetido aqui.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "object-src 'none'",
  "form-action 'self'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()" },
];

const nextConfig: NextConfig = {
  // Só os testes e2e usam outro diretório (um segundo build, com as APIs falhando); fora deles é sempre `.next`.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  experimental: {
    // Rota inexistente: 404 global, sem passar pelo layout raiz (que exige uma das três línguas).
    globalNotFound: true,
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
