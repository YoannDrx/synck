import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  },
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
    ])
  },
  rewrites() {
    return Promise.resolve([
      // Rewrites pour URLs localisées /en/artists → /en/artistes
      {
        source: '/en/artists',
        destination: '/en/artistes',
      },
      {
        source: '/en/artists/:slug',
        destination: '/en/artistes/:slug',
      },
    ])
  },
}

export default nextConfig
