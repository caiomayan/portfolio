import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Só os testes e2e usam outro diretório (um segundo build, com as APIs falhando); fora deles é sempre `.next`.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  experimental: {
    // Rota inexistente: 404 global, sem passar pelo layout raiz (que exige uma das três línguas).
    globalNotFound: true,
  },
};

export default nextConfig;
