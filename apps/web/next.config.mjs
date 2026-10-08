import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  // Pages merged in the docs revamp: their old addresses lead to where the content went.
  async redirects() {
    return [
      { source: '/docs/add-cuts', destination: '/docs/customize', permanent: true },
      { source: '/docs/theming/:page', destination: '/docs/customize', permanent: true },
      { source: '/docs/concepts/:page', destination: '/docs/how-it-works', permanent: true },
    ];
  },
};

export default withMDX(config);
