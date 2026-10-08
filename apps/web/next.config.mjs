import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  // The stylesheet goes inside the HTML, so the first paint doesn't wait for it to download alongside the scripts.
  experimental: { inlineCss: true },
  // Pages merged in the docs revamp: their old addresses lead to where the content went.
  // These addresses answer with HTML or Markdown depending on Accept (proxy.ts), so caches must keep the two apart.
  // Next.js's own Vary list is repeated in case the platform replaces rather than extends it.
  async headers() {
    const vary = [{ key: 'Vary', value: 'rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch, Accept' }];
    return ['/', '/cuts', '/theme', '/docs', '/docs/:path*'].map((source) => ({ source, headers: vary }));
  },
  async redirects() {
    return [
      // Vercel's own addresses serve the same site; send them to the one address search engines should index.
      {
        source: '/:path*',
        has: [{ type: 'host', value: '(?<sub>.*)\\.vercel\\.app' }],
        destination: 'https://keyframery.com/:path*',
        permanent: true,
      },
      { source: '/docs/add-cuts', destination: '/docs/customize', permanent: true },
      { source: '/docs/theming/:page', destination: '/docs/customize', permanent: true },
      { source: '/docs/concepts/:page', destination: '/docs/how-it-works', permanent: true },
    ];
  },
};

export default withMDX(config);
