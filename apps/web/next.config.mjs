import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  // Pages merged in the docs revamp: their old addresses lead to where the content went.
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
