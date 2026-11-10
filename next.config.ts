import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Só os testes e2e usam outro diretório (um segundo build, com as APIs falhando); fora deles é sempre `.next`.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  experimental: {
    // Dois layouts raiz (um por língua, para o `lang` do <html>) não têm um 404 comum.
    globalNotFound: true,
  },
};

export default nextConfig;
