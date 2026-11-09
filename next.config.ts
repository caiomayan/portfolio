import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Dois layouts raiz (um por língua, para o `lang` do <html>) não têm um 404 comum.
    globalNotFound: true,
  },
};

export default nextConfig;
