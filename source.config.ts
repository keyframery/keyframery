import { defineConfig } from "fumadocs-mdx/config"

import { rehypeLazyCode } from "./site/lib/rehype-lazy-code"

export default defineConfig({
  mdxOptions: {
    // High-contrast themes: the default orange tokens fail 4.5:1 on white.
    rehypeCodeOptions: { themes: { light: "github-light-high-contrast", dark: "github-dark-high-contrast" } },
    // First, so the Manual tab's source files never reach the highlighter (site/lib/rehype-lazy-code.ts).
    rehypePlugins: (plugins) => [rehypeLazyCode, ...plugins],
  },
})
