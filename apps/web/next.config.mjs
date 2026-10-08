import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  // The stylesheet goes inside the HTML, so the first paint doesn't wait for it to download alongside the scripts.
  experimental: { inlineCss: true },
  // Pages merged in the docs revamp: their old addresses lead to where the content went.
  // These addresses answer with HTML or Markdown depending on Accept (proxy.ts), so caches must keep the two apart.
  // Next.js's own Vary list is repeated in case the platform replaces rather than extends it. Vercel serves its own
  // Vary regardless, which is fine there: proxy.ts rewrites Markdown requests to their own path before Vercel's cache,
  // the two versions have different ETags under max-age=0, and HTTPS keeps other shared caches out.
  async headers() {
    const vary = [{ key: 'Vary', value: 'rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch, Accept' }];
    // The home page points agents at its machine-readable files (RFC 8288 Link headers, RFC 9727 api-catalog).
    const link = [
      '</.well-known/api-catalog>; rel="api-catalog"',
      '</docs>; rel="service-doc"',
      '</.well-known/mcp/server-card.json>; rel="service-desc"; type="application/json"',
      '</llms.txt>; rel="describedby"; type="text/plain"',
      '</index.md>; rel="alternate"; type="text/markdown"',
    ].join(', ');
    return [
      ...['/', '/cuts', '/theme', '/docs', '/docs/:path*'].map((source) => ({ source, headers: vary })),
      { source: '/', headers: [{ key: 'Link', value: link }] },
    ];
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
      // The tuned components each have their own page now; the coverage table lists them all.
      { source: '/docs/components/tuned', destination: '/docs/compatibility', permanent: true },
    ];
  },
};

export default withMDX(config);
