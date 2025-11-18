import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  redirects() {
    return Promise.resolve([
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
      // Redirections Artistes → Compositeurs (301 permanent pour SEO)
      {
        source: '/fr/artistes',
        destination: '/fr/compositeurs',
        permanent: true,
      },
      {
        source: '/en/artistes',
        destination: '/en/compositeurs',
        permanent: true,
      },
      {
        source: '/fr/artistes/:slug',
        destination: '/fr/compositeurs/:slug',
        permanent: true,
      },
      {
        source: '/en/artistes/:slug',
        destination: '/en/compositeurs/:slug',
        permanent: true,
      },
    ]);
  },
};

export default nextConfig;
