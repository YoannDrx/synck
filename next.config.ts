import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Redirections Portfolio → Projets (301 permanent pour SEO)
      {
        source: '/fr/portfolio',
        destination: '/fr/projets',
        permanent: true,
      },
      {
        source: '/en/portfolio',
        destination: '/en/projets',
        permanent: true,
      },
      {
        source: '/fr/portfolio/:slug',
        destination: '/fr/projets/:slug',
        permanent: true,
      },
      {
        source: '/en/portfolio/:slug',
        destination: '/en/projets/:slug',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
